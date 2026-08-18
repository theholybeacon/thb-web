"use server";

import { chapterGetByCanonicalRefSS } from "../../../chapter/service/chapterGetByCanonicalRefSS";
import { bibleGetAllSS } from "../../../bible/service/bibleGetAllSS";
import { bookGetByAbbreviationAndBibleIdSS } from "../../../book/service/server/bookGetByAbbreviationAndBibleIdSS";
import { DAILY_VERSES } from "@/lib/dailyVerses";
import { FALLBACK_RECOMMENDED_SLUG } from "@/lib/recommendedBible";

export type DailyVerse = {
	reference: string;
	text: string;
	bibleSlug: string | null;
	bookSlug: string | null;
	chapter: number;
	verse: number;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function dayOfYear(localDate: string): number {
	const d = new Date(localDate + "T00:00:00Z");
	const start = Date.UTC(d.getUTCFullYear(), 0, 0);
	return Math.floor((d.getTime() - start) / 86_400_000);
}

/** The verse-of-the-day (deterministic per local date), resolved to text in a translation. */
export async function dailyVerseGetSS(localDate: string, bibleId?: string): Promise<DailyVerse | null> {
	const useDate = DATE_RE.test(localDate) ? localDate : new Date().toISOString().slice(0, 10);
	const ref = DAILY_VERSES[dayOfYear(useDate) % DAILY_VERSES.length];

	const bibles = await bibleGetAllSS();
	/*
	 * Falls back to the recommended English translation, not to "whichever
	 * English row the database happened to return first" — `SELECT *` is
	 * unordered, so the old heuristic picked a different translation in different
	 * environments, and could land on an obscure duplicate.
	 */
	const bible =
		(bibleId && bibles.find((b) => b.id === bibleId)) ||
		bibles.find((b) => b.slug === FALLBACK_RECOMMENDED_SLUG) ||
		bibles.find((b) => b.language?.toLowerCase() === "english") ||
		bibles[0];
	if (!bible) return null;

	const chapter = await chapterGetByCanonicalRefSS(bible.id, ref.bookAbbreviation, ref.chapter);
	if (!chapter) return null;
	const verse = chapter.verses.find((v) => v.verseNumber === ref.verse);
	if (!verse) return null;

	const book = await bookGetByAbbreviationAndBibleIdSS(bible.id, ref.bookAbbreviation);

	return {
		reference: `${chapter.bookName} ${ref.chapter}:${ref.verse}`,
		text: verse.content,
		bibleSlug: bible.slug,
		bookSlug: book?.slug ?? null,
		chapter: ref.chapter,
		verse: ref.verse,
	};
}
