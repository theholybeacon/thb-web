
import { logger } from "@/app/utils/logger";
import { randomUUID } from "crypto";
import { Chapter } from "../model/Chapter";
import { ChapterFetchError } from "../model/ChapterFetchError";
import { parseChapterText, ParsedVerse } from "../model/parseChapterText";

const API_KEY = process.env.BIBLE_API_KEY;
const BASE_URL = "https://api.scripture.api.bible/v1/";


interface ChapterApi {
	number: string,
}

export interface FetchedChapter {
	verses: ParsedVerse[];
	/** api.bible's own count when it sends one — trusted over our parse. */
	verseCount: number | null;
}

/** Upstream request timeout. A hung fetch must not pin a serverless invocation. */
const FETCH_TIMEOUT_MS = 15_000;

/**
 * Once the key reports its daily limit spent, every further call is a guaranteed
 * 403. Short-circuiting for a while keeps a burst of readers from turning one
 * exhausted key into thousands of pointless round-trips. Per-instance only —
 * a damper, not a guarantee.
 */
const QUOTA_COOLDOWN_MS = 10 * 60_000;
let quotaCooldownUntil = 0;


const log = logger.child({ module: 'ChapterExternalAPIDao' });
export class ChapterExternalAPIDao {

	async getAllByBibleApiIdAndBookAbbreviation(bibleApiId: string, bookAbbreviation: string): Promise<Chapter[]> {

		log.trace(`bibles/${bibleApiId}/books/${bookAbbreviation}/chapters`);

		const response = await fetch(
			BASE_URL +
			`bibles/${bibleApiId}/books/${bookAbbreviation}/chapters`,
			{
				headers: {
					'api-key': API_KEY!,
				},
			},
		);
		const data = await response.json();
		const output: Chapter[] = [];
		if (data.data.length > 0) {
			data.data.map((chapter: ChapterApi) => {
				output.push({
					id: randomUUID(),
					bookId: "",
					chapterNumber: chapter.number === "intro" ? 0 : Number(chapter.number),
					numVerses: 0,
					// Computed once the verses are fetched — see ChapterRepository.
					contentHash: null,
					createdAt: new Date(),
					updatedAt: new Date(),
				});
			});
		}
		return output;
	}

	/**
	 * One chapter's verses in ONE request.
	 *
	 * Replaces a per-verse fetch loop that cost 26-176 round-trips per chapter
	 * and silently produced an empty chapter whenever any one of them failed —
	 * which is how an exhausted API key came to render as "No content available
	 * for this chapter". Every failure mode here is typed and thrown so the
	 * caller can tell "upstream is down" from "this chapter has no text".
	 */
	async getChapterText(
		bibleApiId: string,
		bookApiId: string,
		chapterNumber: number,
	): Promise<FetchedChapter> {
		if (Date.now() < quotaCooldownUntil) {
			throw new ChapterFetchError("QUOTA", 403, "daily limit exceeded (cooling down)");
		}

		const chapterId = `${bookApiId}.${chapterNumber === 0 ? "intro" : chapterNumber}`;
		const url =
			`${BASE_URL}bibles/${bibleApiId}/chapters/${chapterId}` +
			`?content-type=text&include-verse-numbers=true` +
			`&include-notes=false&include-titles=false&include-chapter-numbers=false` +
			`&include-verse-spans=false&use-org-id=false`;

		log.trace({ bibleApiId, chapterId }, "fetching chapter text");

		let response: Response;
		try {
			response = await fetch(url, {
				headers: { "api-key": API_KEY! },
				signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
			});
		} catch (e) {
			throw new ChapterFetchError("NETWORK", undefined, e instanceof Error ? e.message : String(e));
		}

		if (!response.ok) {
			throw await this.toFetchError(response);
		}

		const body = (await response.json()) as {
			data?: { content?: string; verseCount?: number };
		};
		const verses = parseChapterText(body.data?.content ?? "");

		// A 200 that yields nothing means the payload shape changed. Throwing
		// keeps it out of the database: an empty chapter written here would be
		// indistinguishable from a real one and would never re-fetch.
		if (verses.length === 0) {
			throw new ChapterFetchError("PARSE", 200, `no verses parsed for ${chapterId}`);
		}

		return { verses, verseCount: body.data?.verseCount ?? null };
	}

	/** Maps an error response onto the typed reasons. */
	private async toFetchError(response: Response): Promise<ChapterFetchError> {
		const status = response.status;
		const text = await response.text().catch(() => "");

		if (status === 404) return new ChapterFetchError("NOT_FOUND", status, text);

		if (status === 403) {
			// api.bible answers BOTH "bad key" and "quota spent" with 403. Only the
			// message separates them, and conflating the two would hide the outage
			// that actually took the reader down.
			if (/limit/i.test(text)) {
				quotaCooldownUntil = Date.now() + QUOTA_COOLDOWN_MS;
				return new ChapterFetchError("QUOTA", status, text);
			}
			return new ChapterFetchError("UNAUTHORIZED", status, text);
		}

		if (status === 401) return new ChapterFetchError("UNAUTHORIZED", status, text);

		if (status === 429) {
			const retryAfter = Number(response.headers.get("retry-after"));
			return new ChapterFetchError(
				"RATE_LIMITED",
				status,
				text,
				Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : undefined,
			);
		}

		return new ChapterFetchError("UPSTREAM", status, text);
	}
}

