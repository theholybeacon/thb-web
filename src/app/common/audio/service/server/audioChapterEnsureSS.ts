"use server";

import { logger } from "@/app/utils/logger";
import { requirePremiumUserSS } from "../../../subscription/service/server/requirePremiumUserSS";
import { BibleRepository } from "../../../bible/repository/BibleRepository";
import { chapterGetByCanonicalRefSS } from "../../../chapter/service/chapterGetByCanonicalRefSS";
import { AudioAssetRepository } from "../../repository/AudioAssetRepository";
import { AudioOpenAiDao } from "../../dao/AudioOpenAiDao";
import { AudioAsset, SynthesisPart, chapterAudioCacheKey, chapterCacheKey, resolveVoice } from "../../model/AudioAsset";

const log = logger.child({ module: "audioChapterEnsureSS" });

/** A generation that has been running longer than this is presumed dead. */
const STALE_GENERATION_MS = 10 * 60 * 1000;

/**
 * Lazily narrates a Bible chapter, cached forever and shared by everyone.
 *
 * A chapter is identical for every user, so this asset is generated once and then
 * serves every user AND every study step that touches the chapter (a step is just
 * a verse-range slice of the same file). Cost therefore trends to zero as usage
 * grows — the second listener of Genesis 1, anywhere in the world, pays nothing.
 *
 * Sharing goes further than one Bible: the asset is keyed by a hash of the TEXT
 * (chapter.contentHash), so the canon variants of a translation — which carry
 * identical words for the books they share — all resolve to the same narration.
 * Genesis 1 is generated once for all fourteen WEB/WEBBE/WEBU/WEBUS rows.
 *
 * Mirrors entityContentEnsureSS: ensureRow → claimForGeneration (conditional
 * UPDATE lock) → generate → markReady/markFailed. Exactly one generation runs
 * even if a hundred users open the chapter at once.
 *
 * Throws "UNAUTHENTICATED" / "PREMIUM_REQUIRED" (audio is a premium feature) and
 * "AUDIO_NOT_LICENSED" when the translation is not cleared for TTS.
 */
export async function audioChapterEnsureSS(params: {
	bibleId: string;
	bookAbbreviation: string;
	chapterNumber: number;
	voice?: string;
}): Promise<AudioAsset | null> {
	const { bibleId, bookAbbreviation, chapterNumber } = params;

	// Premium is enforced here, server-side — the client gate is UX only.
	await requirePremiumUserSS();

	const bible = await new BibleRepository().getById(bibleId);
	if (!bible) throw new Error("BIBLE_NOT_FOUND");

	// Licence gate: we may only synthesize public-domain / open-licensed text.
	// Callers fall back to narrating our own content (see audioStepIntroEnsureSS).
	if (!bible.audioEnabled) throw new Error("AUDIO_NOT_LICENSED");

	const voice = resolveVoice(params.voice);
	const repo = new AudioAssetRepository();

	// The chapter is loaded BEFORE the cache key is built, because the key is derived
	// from the text itself. After the first fetch this is a local Postgres read.
	const chapter = await chapterGetByCanonicalRefSS(bibleId, bookAbbreviation, chapterNumber);
	if (!chapter || chapter.verses.length === 0) throw new Error("CHAPTER_NOT_FOUND");

	// Content-addressed when we have a hash, so every canon variant carrying this
	// same text shares one narration. Falls back to the per-Bible key when the
	// chapter looked incomplete — degraded, but never wrong.
	const cacheKey = chapter.contentHash
		? chapterAudioCacheKey(chapter.contentHash, voice)
		: chapterCacheKey(bibleId, bookAbbreviation, chapterNumber, voice);

	if (!chapter.contentHash) {
		log.warn({ bibleId, bookAbbreviation, chapterNumber }, "no content hash; using per-Bible audio key");
	}

	await repo.ensureRow({
		cacheKey,
		kind: "chapter",
		voice,
		language: bible.language,
		// Provenance only. With a content-addressed key these record ONE of the
		// Bibles carrying this text — whichever happened to trigger generation.
		bibleId,
		bookAbbreviation: bookAbbreviation.toUpperCase(),
		chapterNumber,
	});

	// Free any generation stranded by a crashed function before trying to claim.
	await repo.reclaimStale(STALE_GENERATION_MS);

	if (!(await repo.claimForGeneration(cacheKey))) {
		// Already ready, or someone else is generating it right now.
		return await repo.getByCacheKey(cacheKey);
	}

	try {
		// Sort explicitly: the clip order BECOMES the verse offsets, so a misordered
		// verse would corrupt every offset after it.
		const verses = [...chapter.verses].sort((a, b) => a.verseNumber - b.verseNumber);

		const parts: SynthesisPart[] = [
			// Chapter-scoped heading, so it stays shareable. A step starting at verse 5
			// simply begins playback past it.
			{ kind: "heading" as const, verseNumber: null, text: `${chapter.bookName} ${chapterNumber}` },
			...verses.map((v) => ({
				kind: "verse" as const,
				verseNumber: v.verseNumber,
				text: v.content.trim(),
			})),
		].filter((p) => p.text.length > 0);

		const oversized = parts.find((p) => p.text.length > AudioOpenAiDao.MAX_INPUT_CHARS);
		if (oversized) {
			await repo.markFailed(cacheKey, `verse ${oversized.verseNumber} exceeds TTS input limit`);
			return await repo.getByCacheKey(cacheKey);
		}

		const result = await repo.synthesizeAndStore({
			// Path follows the cache key, so the stored file dedupes exactly as the
			// row does — one object per distinct text, not one per Bible.
			pathname: chapter.contentHash
				? `audio/chapter/${chapter.contentHash}/${voice}.mp3`
				: `audio/chapter/${bibleId}/${bookAbbreviation.toUpperCase()}/${chapterNumber}-${voice}.mp3`,
			voice,
			language: bible.language,
			parts,
		});

		await repo.markReady(cacheKey, {
			model: AudioOpenAiDao.MODEL,
			blobUrl: result.url,
			blobPathname: result.pathname,
			byteSize: result.byteSize,
			durationMs: result.durationMs,
			segments: result.segments,
		});

		log.info(
			{ cacheKey, verses: verses.length, durationMs: result.durationMs },
			"chapter narration ready"
		);
	} catch (err) {
		await repo.markFailed(cacheKey, err instanceof Error ? err.message : String(err));
	}

	return await repo.getByCacheKey(cacheKey);
}
