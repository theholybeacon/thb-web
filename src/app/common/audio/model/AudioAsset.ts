import { audioAssetTable, AudioSegment } from "@/db/schema/audioAsset";

export type AudioAsset = typeof audioAssetTable.$inferSelect;
export type AudioAssetInsert = typeof audioAssetTable.$inferInsert;
export type { AudioSegment };

export type AudioAssetKind = "chapter" | "step_intro";
export type AudioGenerationStatus = "pending" | "generating" | "ready" | "failed";

/**
 * Two narrators: one male, one female.
 *
 * Voice is part of the cache key, so every extra voice multiplies generation cost
 * AND fragments the shared cache that makes this design cheap — five users picking
 * five voices for Genesis 1 means paying five times instead of once. A male/female
 * pair is the smallest set that still lets someone pick a voice they can listen to
 * for an hour. Do not turn this into a 13-voice picker.
 *
 * These are concrete OpenAI voice ids rather than semantic "male"/"female" values
 * on purpose: the cache key must reflect the actual audio. Swapping the underlying
 * voice SHOULD invalidate the cache, because the narration genuinely changes.
 */
export const AUDIO_VOICES = ["onyx", "sage"] as const;
export type AudioVoice = (typeof AUDIO_VOICES)[number];

export const DEFAULT_VOICE: AudioVoice = "sage";

/** i18n key under the `audio` namespace for each voice's user-facing label. */
export const VOICE_LABEL_KEY: Record<AudioVoice, string> = {
	onyx: "voiceMale",
	sage: "voiceFemale",
};

/** Resolves a requested voice, falling back to the default if it is unknown. */
export function resolveVoice(requested?: string | null): AudioVoice {
	const v = requested?.trim().toLowerCase();
	return (AUDIO_VOICES as readonly string[]).includes(v ?? "") ? (v as AudioVoice) : DEFAULT_VOICE;
}

/**
 * CLIENT-SIDE track identity. Built by the UI, which knows the Bible it is reading
 * but not the text hash, and parsed back by the player to call the ensure route.
 *
 * This is deliberately NOT the storage key — see chapterAudioCacheKey.
 */
export function chapterCacheKey(
	bibleId: string,
	bookAbbreviation: string,
	chapterNumber: number,
	voice: AudioVoice
): string {
	return `chapter:${bibleId}:${bookAbbreviation.toUpperCase()}:${chapterNumber}:${voice}`;
}

/**
 * STORAGE key for a chapter narration, keyed by the text itself.
 *
 * A translation is listed once per canon (Protestant/Catholic/Orthodox/Ecumenical)
 * and those rows carry identical text for the books they share — Genesis 1 is the
 * same in all four WEB rows, and in all fourteen WEB/WEBBE/WEBU/WEBUS rows. Keying
 * on the content hash instead of the bibleId means that chapter is narrated once
 * and serves every one of them.
 */
export function chapterAudioCacheKey(contentHash: string, voice: AudioVoice): string {
	return `chapter:${contentHash}:${voice}`;
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

	/**
	 * Canonical anchor of the narrated passage. Present for chapter tracks on both
	 * reading surfaces, so the player can record a chapter completion even when
	 * the audio finishes with the reader unmounted and the phone locked — which is
	 * exactly when listening outside a study used to record nothing at all.
	 */
	bookAbbreviation?: string;
	chapterNumber?: number;
	bibleId?: string;
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
