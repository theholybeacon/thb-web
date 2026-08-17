"use server";

import { requirePremiumUserSS } from "../../../subscription/service/server/requirePremiumUserSS";
import { AudioAssetRepository } from "../../repository/AudioAssetRepository";
import { AudioAsset } from "../../model/AudioAsset";

/**
 * Read-only status poll. Never generates.
 *
 * The client polls this while an asset is `generating` so it can swap in the audio
 * the moment it's ready, without racing a second generation.
 *
 * Currently unused — the player polls /api/audio/ensure instead. If you do wire it
 * up, pass STORAGE keys (chapterAudioCacheKey, built from chapter.contentHash), not
 * the client-side chapterCacheKey: since content-addressing, the two differ and a
 * client key will simply match nothing.
 */
export async function audioAssetsGetSS(cacheKeys: string[]): Promise<AudioAsset[]> {
	await requirePremiumUserSS();
	if (cacheKeys.length === 0) return [];
	return await new AudioAssetRepository().getManyByCacheKeys(cacheKeys);
}
