"use server";

import { requirePremiumUserSS } from "../../../subscription/service/server/requirePremiumUserSS";
import { audioChapterGenerate } from "../audioChapterGenerate";
import { AudioAsset } from "../../model/AudioAsset";

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
 * The generation itself lives in ../audioChapterGenerate so the backfill script
 * can pre-warm chapters without a session. This function is the PREMIUM
 * boundary and nothing else — keep it that way. The licence gate lives with the
 * generation, because it is a property of the content rather than the caller.
 *
 * Throws "UNAUTHENTICATED" / "PREMIUM_REQUIRED" (audio is a premium feature),
 * "AUDIO_NOT_LICENSED" when the translation is not cleared for TTS, and
 * "BIBLE_NOT_FOUND" / "CHAPTER_NOT_FOUND".
 */
export async function audioChapterEnsureSS(params: {
	bibleId: string;
	bookAbbreviation: string;
	chapterNumber: number;
	voice?: string;
}): Promise<AudioAsset | null> {
	// Premium is enforced here, server-side — the client gate is UX only.
	await requirePremiumUserSS();

	return await audioChapterGenerate(params);
}
