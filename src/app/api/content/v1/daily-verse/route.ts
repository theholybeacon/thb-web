import { canonBook } from "@/app/common/canon/model/canon";
import { DAILY_VERSES } from "@/lib/dailyVerses";
import { loadChapterForApi } from "@/lib/contentApi/chapterAccess";
import { ok } from "@/lib/contentApi/respond";
import { resolveTranslation, toTranslationSummary } from "@/lib/contentApi/translations";
import { badRequest, notFound, withContentApi } from "@/lib/contentApi/withContentApi";

/**
 * The verse of the day — the same one the product shows readers on that date.
 *
 * Reads the product's own curated list and its day-of-year selection, so a
 * daily piece of content built from this endpoint is talking about the verse
 * the app is actually featuring. Deterministic: the same date always yields the
 * same verse, which makes a scheduled daily job reproducible and re-runnable.
 */
export const dynamic = "force-dynamic";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Matches dailyVerseGetSS so the API and the app never disagree on a date. */
function dayOfYear(localDate: string): number {
	const d = new Date(localDate + "T00:00:00Z");
	const start = Date.UTC(d.getUTCFullYear(), 0, 0);
	return Math.floor((d.getTime() - start) / 86_400_000);
}

export const GET = withContentApi(async (request, { identity }) => {
	const search = request.nextUrl.searchParams;
	const requested = search.get("date")?.trim();

	if (requested && !DATE_RE.test(requested)) {
		throw badRequest("INVALID_DATE", { message: "Expected date=YYYY-MM-DD." });
	}
	const date = requested || new Date().toISOString().slice(0, 10);

	const pick = DAILY_VERSES[dayOfYear(date) % DAILY_VERSES.length];
	const bible = await resolveTranslation(search.get("translation"));

	const { book, chapter } = await loadChapterForApi({
		bible,
		usfm: pick.bookAbbreviation,
		chapterNumber: pick.chapter,
		budgetKey: identity.label,
	});

	const verse = chapter.verses.find((v) => v.verseNumber === pick.verse);
	if (!verse) {
		throw notFound("VERSE_NOT_FOUND", {
			message: `${pick.bookAbbreviation} ${pick.chapter}:${pick.verse} is not present in ${bible.name}.`,
		});
	}

	return ok({
		date,
		reference: {
			canonical: `${pick.bookAbbreviation} ${pick.chapter}:${pick.verse}`,
			display: `${canonBook(pick.bookAbbreviation)?.englishName ?? book.name} ${pick.chapter}:${pick.verse}`,
			usfm: pick.bookAbbreviation,
			bookName: book.name,
			chapter: pick.chapter,
			verse: pick.verse,
			/** Feed this straight back to /verses/{reference}. */
			apiReference: `${pick.bookAbbreviation.toLowerCase()}-${pick.chapter}-${pick.verse}`,
		},
		// Verbatim from the database.
		text: verse.content,
		readerUrl: `/bible/${bible.slug}/${book.slug}/${pick.chapter}#verse-${pick.verse}`,
		translation: toTranslationSummary(bible),
		rotation: {
			curatedVerses: DAILY_VERSES.length,
			note: "Selection is day-of-year modulo the curated list, so it repeats once the list is exhausted.",
		},
	});
});
