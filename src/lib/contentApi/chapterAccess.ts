import type { Bible } from "@/app/common/bible/model/Bible";
import type { Book } from "@/app/common/book/model/Book";
import { BookPostgreSQLDao } from "@/app/common/book/dao/BookPostgreSQLDao";
import type { ChapterVer } from "@/app/common/chapter/model/Chapter";
import { chapterGetStoredSS } from "@/app/common/chapter/service/chapterGetStoredSS";
import { chapterGetByCanonicalRefSS } from "@/app/common/chapter/service/chapterGetByCanonicalRefSS";
import { tryConsumeHydration } from "./hydrationBudget";
import { ContentApiFailure, notFound } from "./withContentApi";

/**
 * Chapter loading for the Content API, stored-first and budget-bounded.
 *
 * Verse text is hydrated lazily: a chapter nobody has opened has no rows, and
 * filling it costs one api.bible request from a daily quota shared with live
 * readers. So the order here is deliberate:
 *
 *   1. serve what is already stored — free, unmetered, the overwhelming case
 *   2. only if it is cold, spend one unit of the daily hydration budget
 *      and go through the reader's own path (chapterGetByCanonicalRefSS)
 *   3. if the budget is gone, degrade to stored-only and say so plainly
 *
 * Bulk coverage belongs to `npm run warm:bible`, not to this endpoint.
 */

const bookDao = new BookPostgreSQLDao();

export type ChapterAccess = {
	book: Book;
	chapter: ChapterVer;
	/** True when this request paid for an upstream fetch. */
	hydrated: boolean;
};

/** A stored chapter is usable when it holds every verse upstream said it has. */
function isComplete(chapter: ChapterVer | undefined): chapter is ChapterVer {
	if (!chapter) return false;
	if (chapter.verses.length === 0) return false;
	const expected = chapter.numVerses ?? 0;
	return expected <= 0 || chapter.verses.length >= expected;
}

export async function loadChapterForApi(params: {
	bible: Bible;
	usfm: string;
	chapterNumber: number;
}): Promise<ChapterAccess> {
	const { bible, usfm, chapterNumber } = params;

	const storedBook = await bookDao.getByAbbreviationAndBibleId(bible.id, usfm);
	if (storedBook) {
		const stored = await chapterGetStoredSS(storedBook.id, chapterNumber);

		// -1 means upstream has told us this chapter does not exist here. That is
		// a settled answer, not a cold cache — never spend budget retrying it.
		if (stored?.numVerses === -1) {
			throw notFound("CHAPTER_NOT_FOUND", {
				message: `${usfm} ${chapterNumber} does not exist in ${bible.name}.`,
			});
		}

		if (isComplete(stored)) {
			return { book: storedBook, chapter: stored, hydrated: false };
		}
	}

	if (!tryConsumeHydration()) {
		throw notFound("NOT_HYDRATED", {
			message:
				`${usfm} ${chapterNumber} is not cached for ${bible.slug}, and the daily ` +
				`hydration budget is spent. Pre-load the translation instead of crawling cold chapters.`,
			hint: `npm run warm:bible -- --bible ${bible.slug}`,
		});
	}

	// The reader's own path: resolves the book (seeding the book list if this
	// translation has never been opened) and fetches the whole chapter in one
	// upstream request.
	const loaded = await chapterGetByCanonicalRefSS(bible.id, usfm, chapterNumber);
	const book = storedBook ?? (await bookDao.getByAbbreviationAndBibleId(bible.id, usfm));

	if (!loaded || !book || loaded.verses.length === 0) {
		// An exhausted upstream quota is a TEMPORARY, retryable condition and must
		// not be reported as "this chapter does not exist" — a scheduled job would
		// cache that conclusion and stop asking. loadError already distinguishes
		// the two cases; pass the distinction through instead of flattening it.
		if (loaded?.loadError === "quota") {
			throw new ContentApiFailure("UPSTREAM_QUOTA_EXCEEDED", 503, {
				message:
					`The upstream scripture provider's daily quota is exhausted, so ${usfm} ${chapterNumber} ` +
					`could not be fetched for ${bible.slug}. Text already cached is unaffected. Retry tomorrow, ` +
					`or pre-load the translation.`,
				hint: `npm run warm:bible -- --bible ${bible.slug}`,
				retryable: true,
			});
		}
		if (loaded?.loadError === "unavailable") {
			throw new ContentApiFailure("UPSTREAM_UNAVAILABLE", 503, {
				message: `The upstream scripture provider failed while fetching ${usfm} ${chapterNumber}.`,
				retryable: true,
			});
		}
		throw notFound("CHAPTER_NOT_FOUND", {
			message: `No text available for ${usfm} ${chapterNumber} in ${bible.name}.`,
		});
	}

	return { book, chapter: loaded, hydrated: true };
}
