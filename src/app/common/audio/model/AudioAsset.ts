import { audioAssetTable, AudioSegment } from "@/db/schema/audioAsset";

export type AudioAsset = typeof audioAssetTable.$inferSelect;
export type AudioAssetInsert = typeof audioAssetTable.$inferInsert;
export type { AudioSegment };

export type AudioAssetKind = "chapter" | "step_intro";
export type AudioGenerationStatus = "pending" | "generating" | "ready" | "failed";

/**
 * Deliberately small.
 *
 * Voice is part of the cache key, so every extra voice multiplies generation cost
 * AND fragments the shared cache that makes this design cheap — five users picking
 * five voices for Genesis 1 means paying five times instead of once. Three voices
 * is the most we can offer without undermining that. Do not turn this into a
 * 13-voice picker.
 */
export const AUDIO_VOICES = ["sage", "onyx", "coral"] as const;
export type AudioVoice = (typeof AUDIO_VOICES)[number];

export const DEFAULT_VOICE: AudioVoice = "sage";

/** Resolves a requested voice, falling back to the default if it is unknown. */
export function resolveVoice(requested?: string | null): AudioVoice {
	const v = requested?.trim().toLowerCase();
	return (AUDIO_VOICES as readonly string[]).includes(v ?? "") ? (v as AudioVoice) : DEFAULT_VOICE;
}

export function chapterCacheKey(
	bibleId: string,
	bookAbbreviation: string,
	chapterNumber: number,
	voice: AudioVoice
): string {
	return `chapter:${bibleId}:${bookAbbreviation.toUpperCase()}:${chapterNumber}:${voice}`;
}

export function stepIntroCacheKey(studyStepId: string, voice: AudioVoice): string {
	return `step:${studyStepId}:${voice}`;
}

/** A part queued for synthesis. One MP3 clip is produced per part. */
export type SynthesisPart = {
	kind: AudioSegment["kind"];
	verseNumber: number | null;
	text: string;
};

/**
 * What the client player consumes. A step is a *slice* of a chapter asset —
 * `startMs`/`endMs` window into the same file — which is why one cached chapter
 * serves every study step that touches it.
 */
export type AudioTrack = {
	cacheKey: string;
	kind: AudioAssetKind;
	status: AudioGenerationStatus;
	url: string | null;
	segments: AudioSegment[];
	/** Window within the asset. `endMs` of 0 means "to the end of the asset". */
	startMs: number;
	endMs: number;
	durationMs: number;

	title: string;
	subtitle: string;
	downloadable: boolean;
	/**
	 * Steers pronunciation. Chapter narration reads this off the bible row server-side,
	 * but step-intro narration has no bible to look up — without it, a Spanish
	 * explanation gets read with English pronunciation.
	 */
	language?: string;

	/** Set for study playback so the player can persist completion with the screen locked. */
	sessionId?: string;
	stepId?: string;
	isLastChapterInStep?: boolean;
};

/** Narration direction. Steers tone without changing the text. */
export function narrationInstructions(language?: string | null): string {
	const lang = language?.trim() || "the source language";
	return (
		`Read this Bible passage as a calm, warm, unhurried narrator. ` +
		`Natural pacing with a clear beat between sentences, reverent but not theatrical. ` +
		`Do not dramatize, do not add emphasis that is not in the text. ` +
		`Pronounce all names and words with correct ${lang} pronunciation.`
	);
}
