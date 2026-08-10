import { concatMp3, parseMp3 } from "@/lib/mp3";
import { logger } from "@/app/utils/logger";
import { AudioAssetPostgreSQLDao } from "../dao/AudioAssetPostgreSQLDao";
import { AudioOpenAiDao } from "../dao/AudioOpenAiDao";
import { AudioBlobDao } from "../dao/AudioBlobDao";
import { AudioAsset, AudioAssetInsert, AudioSegment, AudioVoice, SynthesisPart } from "../model/AudioAsset";

const log = logger.child({ module: "AudioAssetRepository" });

export interface SynthesizedAudio {
	url: string;
	pathname: string;
	byteSize: number;
	durationMs: number;
	segments: AudioSegment[];
}

export class AudioAssetRepository {
	private dao = new AudioAssetPostgreSQLDao();
	private ai = new AudioOpenAiDao();
	private blob = new AudioBlobDao();

	getByCacheKey(cacheKey: string): Promise<AudioAsset | null> {
		return this.dao.getByCacheKey(cacheKey);
	}

	getManyByCacheKeys(cacheKeys: string[]): Promise<AudioAsset[]> {
		return this.dao.getManyByCacheKeys(cacheKeys);
	}

	ensureRow(row: AudioAssetInsert): Promise<void> {
		return this.dao.ensureRow(row);
	}

	claimForGeneration(cacheKey: string): Promise<boolean> {
		return this.dao.claimForGeneration(cacheKey);
	}

	markReady(cacheKey: string, data: Partial<AudioAsset>): Promise<void> {
		return this.dao.markReady(cacheKey, data);
	}

	markFailed(cacheKey: string, error: string): Promise<void> {
		return this.dao.markFailed(cacheKey, error);
	}

	reclaimStale(olderThanMs: number): Promise<number> {
		return this.dao.reclaimStale(olderThanMs);
	}

	/**
	 * Synthesizes each part, stitches the clips into one MP3, uploads it, and
	 * reports exactly where each part begins and ends.
	 *
	 * The offsets come from counting MPEG frames in each clip, not from estimating
	 * against a words-per-minute guess — so verse highlighting and seek-to-verse
	 * are exact. Producing ONE file (rather than one per verse) is what makes
	 * lock-screen playback and scrubbing work: a single <audio> src, no gaps, no
	 * per-verse refetches.
	 *
	 * Knows nothing about Bibles or study steps — callers decide what the parts are.
	 */
	async synthesizeAndStore(params: {
		pathname: string;
		voice: AudioVoice;
		language?: string | null;
		parts: SynthesisPart[];
	}): Promise<SynthesizedAudio> {
		const { pathname, voice, language, parts } = params;
		if (parts.length === 0) throw new Error("synthesizeAndStore: no parts");

		const clips = await this.ai.synthesizeMany(
			parts.map((p) => ({ text: p.text, voice, language }))
		);

		const segments: AudioSegment[] = [];
		let cursorMs = 0;
		for (let i = 0; i < parts.length; i++) {
			const info = parseMp3(clips[i]);
			if (!info.cbr) {
				// Not fatal — offsets stay correct because we frame-count rather than
				// derive from bitrate — but the browser may seek imprecisely.
				log.warn({ pathname, part: i }, "VBR clip from TTS; seeking may be approximate");
			}
			segments.push({
				kind: parts[i].kind,
				verseNumber: parts[i].verseNumber,
				text: parts[i].text,
				startMs: Math.round(cursorMs),
				endMs: Math.round(cursorMs + info.durationMs),
			});
			cursorMs += info.durationMs;
		}

		const { buffer } = concatMp3(clips);
		const uploaded = await this.blob.upload(pathname, buffer);

		log.info(
			{ pathname, parts: parts.length, durationMs: Math.round(cursorMs), bytes: uploaded.size },
			"synthesized audio asset"
		);

		return {
			url: uploaded.url,
			pathname: uploaded.pathname,
			byteSize: uploaded.size,
			durationMs: Math.round(cursorMs),
			segments,
		};
	}
}
