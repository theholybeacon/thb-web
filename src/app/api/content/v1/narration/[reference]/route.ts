import { BookPostgreSQLDao } from "@/app/common/book/dao/BookPostgreSQLDao";
import { chapterGetStoredSS } from "@/app/common/chapter/service/chapterGetStoredSS";
import {
	chapterAudioCacheKey,
	chapterCacheKey,
	resolveVoice,
} from "@/app/common/audio/model/AudioAsset";
import { AudioAssetRepository } from "@/app/common/audio/repository/AudioAssetRepository";
import { windowSegments } from "@/lib/contentApi/narrationWindow";
import { canonicalReference, formatReference, parseReference } from "@/lib/contentApi/reference";
import { ok } from "@/lib/contentApi/respond";
import { resolveTranslation, toTranslationSummary } from "@/lib/contentApi/translations";
import { notFound, withContentApiParams } from "@/lib/contentApi/withContentApi";

/**
 * Narration audio for a passage, with the timing data an animator needs.
 *
 * STRICTLY A LOOKUP. Narration is generated lazily by a premium, signed-in
 * request against a licence-cleared translation; a GET here neither can nor
 * should start that job. If the audio has not been produced, this says so
 * rather than making one up. Pre-generate with scripts/backfill-bible-audio.ts.
 *
 * TIMESTAMPS — read this before building anything downstream:
 *   - Verse-level offsets EXIST and are EXACT. They are counted from MPEG frames
 *     in the source clips, not interpolated from a words-per-minute guess.
 *   - Word-level offsets DO NOT EXIST anywhere in this system. Each verse is
 *     synthesized as one clip, so a verse is the smallest addressable unit.
 *   - The product's "alignment" data is Strong's original-language word mapping.
 *     It is lexical, not temporal, and cannot be used for audio sync.
 */
export const dynamic = "force-dynamic";

const bookDao = new BookPostgreSQLDao();

export const GET = withContentApiParams<{ reference: string }>(async (request, { params }) => {
	const ref = parseReference(params.reference);
	const search = request.nextUrl.searchParams;
	const bible = await resolveTranslation(search.get("translation"));
	const voice = resolveVoice(search.get("voice"));
	const translation = toTranslationSummary(bible);

	// A translation we may not narrate has no asset and never will. Say why,
	// rather than returning a bare "not found" the caller would retry forever.
	if (!bible.audioEnabled) {
		throw notFound("NOT_LICENSED", {
			status: "not_licensed",
			message:
				`${bible.name} is not cleared for narration, so no audio exists or can be generated for it. ` +
				"Request an open-licensed translation instead.",
			translation,
		});
	}

	const book = await bookDao.getByAbbreviationAndBibleId(bible.id, ref.usfm);
	// Deliberately the stored-only read: no narration can exist for a chapter
	// whose text was never fetched, so there is nothing to gain by hydrating.
	const chapter = book ? await chapterGetStoredSS(book.id, ref.chapter) : undefined;

	if (!book || !chapter) {
		throw notFound("NOT_GENERATED", {
			status: "not_generated",
			message: `${canonicalReference(ref)} has no cached text in ${bible.name}, so no narration exists.`,
			hint: `npm run warm:bible -- --bible ${bible.slug}`,
		});
	}

	const repo = new AudioAssetRepository();
	// Content-addressed first — that is the key generation actually writes, and
	// it is shared by every canon variant carrying the same words. The per-Bible
	// key is the documented fallback for chapters stored without a hash.
	const asset =
		(chapter.contentHash
			? await repo.getByCacheKey(chapterAudioCacheKey(chapter.contentHash, voice))
			: null) ??
		(await repo.getByCacheKey(chapterCacheKey(bible.id, ref.usfm, ref.chapter, voice)));

	if (!asset || asset.generationStatus !== "ready" || !asset.blobUrl) {
		throw notFound("NOT_GENERATED", {
			status: asset ? `not_ready:${asset.generationStatus}` : "not_generated",
			message:
				`No narration has been produced for ${canonicalReference(ref)} in ${bible.name} ` +
				`with the "${voice}" voice. Generation is a premium, signed-in action and is never ` +
				"triggered by this API.",
			translation,
		});
	}

	const window = windowSegments(asset.segments, ref.startVerse, ref.endVerse);

	if (ref.startVerse !== null && window.segments.length === 0) {
		throw notFound("VERSE_NOT_NARRATED", {
			message: `The narration of ${book.name} ${ref.chapter} contains no segment for the requested verses.`,
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
		},
		audio: {
			/** One MP3 for the whole chapter. Use the window offsets to play a passage. */
			url: asset.blobUrl,
			format: "audio/mpeg",
			voice,
			/** Duration of the entire chapter file. */
			durationMs: asset.durationMs,
			byteSize: asset.byteSize,
			language: asset.language,
			generatedAt: asset.generatedAt,
		},
		passage: {
			/** Where the requested verses sit inside the chapter file. */
			startMs: window.startMs,
			endMs: window.endMs,
			durationMs: window.endMs - window.startMs,
		},
		timestamps: {
			granularity: "verse" as const,
			wordLevelAvailable: false,
			exact: true,
			note:
				"Offsets are frame-counted from the source MP3s, so they are exact rather than " +
				"interpolated. No word-level timing exists in this system; do not infer it.",
			segments: window.segments,
		},
		translation,
	});
});
