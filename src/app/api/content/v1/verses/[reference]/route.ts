import { loadChapterForApi } from "@/lib/contentApi/chapterAccess";
import { canonicalReference, formatReference, parseReference } from "@/lib/contentApi/reference";
import { ok } from "@/lib/contentApi/respond";
import { resolveTranslation, toTranslationSummary } from "@/lib/contentApi/translations";
import { notFound, withContentApiParams } from "@/lib/contentApi/withContentApi";

/**
 * Exact verse text for a reference, in a given translation.
 *
 * `content` is returned EXACTLY as stored, with no trimming, collapsing or
 * re-encoding. The whitespace is load-bearing — a blank line is a paragraph
 * break, a bare newline is a poetry line break, a leading pipe pair is a line
 * break in the LSV (see src/app/common/verse/model/verseLayout.ts). Anything
 * that "tidies" it would silently misquote Scripture, which is the single
 * failure this API exists to prevent.
 */
export const dynamic = "force-dynamic";

export const GET = withContentApiParams<{ reference: string }>(async (request, { params }) => {
	const ref = parseReference(params.reference);
	const bible = await resolveTranslation(request.nextUrl.searchParams.get("translation"));

	const { book, chapter, hydrated } = await loadChapterForApi({
		bible,
		usfm: ref.usfm,
		chapterNumber: ref.chapter,
	});

	const ordered = [...chapter.verses].sort((a, b) => a.verseNumber - b.verseNumber);
	const selected =
		ref.startVerse === null
			? ordered
			: ordered.filter(
					(v) => v.verseNumber >= ref.startVerse! && v.verseNumber <= (ref.endVerse ?? ref.startVerse!),
				);

	if (selected.length === 0) {
		throw notFound("VERSE_NOT_FOUND", {
			message: `${canonicalReference(ref)} is not present in ${bible.name}.`,
			chapterVerseCount: ordered.length,
		});
	}

	return ok({
		reference: {
			requested: params.reference,
			canonical: canonicalReference(ref),
			display: formatReference(ref),
			usfm: ref.usfm,
			bookName: book.name,
			chapter: ref.chapter,
			startVerse: selected[0].verseNumber,
			endVerse: selected[selected.length - 1].verseNumber,
		},
		// Verbatim from the database. Do not normalise.
		verses: selected.map((v) => ({ verse: v.verseNumber, text: v.content })),
		/** The selection joined with single spaces, for callers that want one string. */
		text: selected.map((v) => v.content).join(" "),
		chapter: {
			number: chapter.chapterNumber,
			verseCount: ordered.length,
			readerUrl: `/bible/${bible.slug}/${book.slug}/${chapter.chapterNumber}`,
			verseUrl:
				ref.startVerse === null
					? null
					: `/bible/${bible.slug}/${book.slug}/${chapter.chapterNumber}#verse-${ref.startVerse}`,
		},
		translation: toTranslationSummary(bible),
		/** True when this request paid an upstream fetch to fill the cache. */
		hydratedOnDemand: hydrated,
	});
});
