import { logger } from "@/app/utils/logger";
import { extractStrongs, normalizeSurface } from "@/lib/strongs";
import type { ParsedAlignmentWord } from "../model/parseAlignmentJsonl";

const log = logger.child({ module: "AlignmentApiBibleDao" });

const BASE = "https://api.scripture.api.bible/v1";

/** `<span data-strong="G0025" class="w">geliebt</span>` — the tagged word form. */
const TAGGED = /<span[^>]*data-strong="([GH]\d+)"[^>]*>([\s\S]*?)<\/span>/g;
/** Verse boundary marker: `<span data-number="16" data-sid="JHN 3:16" class="v">`. */
const VERSE_MARK = /<span[^>]*class="v"[^>]*data-number="(\d+)"[^>]*>|<span[^>]*data-number="(\d+)"[^>]*class="v"[^>]*>/g;
const STRIP_TAGS = /<[^>]+>/g;

/**
 * Word-level Strong's straight from api.bible.
 *
 * A few editions — L1912 among them — carry `data-strong` inline when a chapter
 * is fetched as HTML. That makes them a third kind of alignment source, and by
 * far the cheapest: the words come from the same API that already serves the
 * reader's text, so there is no corpus to extract, host, or keep in sync.
 */
export class AlignmentApiBibleDao {

	private get key(): string {
		const key = process.env.BIBLE_API_KEY;
		if (!key) throw new Error("BIBLE_API_KEY_MISSING");
		return key;
	}

	/**
	 * One chapter's aligned words. Returns [] when the chapter has no tagged
	 * words, which callers must treat as "this edition is not aligned here"
	 * rather than as an error.
	 */
	async fetchChapter(
		bibleApiId: string,
		sourceCode: string,
		bookAbbreviation: string,
		chapter: number,
	): Promise<ParsedAlignmentWord[]> {
		const url = `${BASE}/bibles/${bibleApiId}/chapters/${bookAbbreviation}.${chapter}?content-type=html`;
		const res = await fetch(url, { headers: { "api-key": this.key } });
		if (res.status === 404) return [];
		if (!res.ok) throw new Error(`ALIGNMENT_APIBIBLE_${res.status}`);

		const body = (await res.json()) as { data?: { content?: string } };
		return this.parse(body.data?.content ?? "", sourceCode, bookAbbreviation, chapter);
	}

	/**
	 * Splits a chapter's HTML on its verse markers and derives rows per verse.
	 *
	 * Produces exactly the shape `parseAlignmentJsonl` produces, so the loader,
	 * the lock and the lookup ladder are all reused unchanged — only the fetch
	 * differs between an api.bible source and a Blob-backed one.
	 */
	parse(
		html: string,
		sourceCode: string,
		bookAbbreviation: string,
		chapter: number,
	): ParsedAlignmentWord[] {
		const out: ParsedAlignmentWord[] = [];

		// Verse boundaries, in document order.
		const marks: { verse: number; at: number }[] = [];
		VERSE_MARK.lastIndex = 0;
		for (let m = VERSE_MARK.exec(html); m; m = VERSE_MARK.exec(html)) {
			const n = Number(m[1] ?? m[2]);
			if (Number.isInteger(n)) marks.push({ verse: n, at: m.index });
		}
		if (marks.length === 0) return out;

		for (let i = 0; i < marks.length; i++) {
			const segment = html.slice(marks[i].at, marks[i + 1]?.at ?? html.length);
			const verse = marks[i].verse;

			// `occurrence` must be counted per verse, in reading order, exactly as
			// the JSONL path does — it is what lets a repeated word resolve to the
			// right original term.
			const counts = new Map<string, number>();
			let wordIndex = 0;

			TAGGED.lastIndex = 0;
			for (let w = TAGGED.exec(segment); w; w = TAGGED.exec(segment)) {
				const surface = w[2].replace(STRIP_TAGS, "").trim();
				if (!surface) continue;
				const surfaceNorm = normalizeSurface(surface);
				if (!surfaceNorm) continue;

				const occurrence = (counts.get(surfaceNorm) ?? 0) + 1;
				counts.set(surfaceNorm, occurrence);

				out.push({
					sourceCode,
					bookAbbreviation,
					chapter,
					verse,
					wordIndex,
					occurrence,
					surface,
					surfaceNorm,
					strongs: extractStrongs(w[1]),
					lemma: null, // api.bible gives the number only, no headword
					morph: null,
				});
				wordIndex++;
			}
		}

		log.trace({ sourceCode, bookAbbreviation, chapter, words: out.length }, "parsed api.bible chapter");
		return out;
	}
}
