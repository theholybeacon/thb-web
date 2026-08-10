"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	ReactNode,
} from "react";
import { AudioAsset, AudioSegment, AudioTrack, AudioVoice, DEFAULT_VOICE, resolveVoice } from "@/app/common/audio/model/AudioAsset";
import { getCachedAudioUrl } from "@/lib/audioCache";

export type AudioStatus =
	| "idle"
	| "loading"      // fetching / ensuring the asset
	| "generating"   // server is synthesizing; poll until ready
	| "ready"
	| "playing"
	| "paused"
	| "error";

export interface AudioPlayerApi {
	queue: AudioTrack[];
	index: number;
	track: AudioTrack | null;
	status: AudioStatus;
	/** Position within the current TRACK (a track may be a slice of a longer asset). */
	positionMs: number;
	durationMs: number;
	activeSegment: AudioSegment | null;
	activeVerseNumber: number | null;
	playbackRate: number;
	volume: number;
	voice: AudioVoice;
	error: string | null;

	load(queue: AudioTrack[], opts?: { startIndex?: number }): Promise<void>;
	play(): Promise<void>;
	pause(): void;
	toggle(): Promise<void>;
	seekMs(ms: number): void;
	seekToVerse(verseNumber: number): void;
	nextTrack(): Promise<void>;
	prevTrack(): Promise<void>;
	setPlaybackRate(rate: number): void;
	setVolume(v: number): void;
	setVoice(v: AudioVoice): void;
	stop(): void;
}

const AudioPlayerContext = createContext<AudioPlayerApi | null>(null);

const PREFS_KEY = "thb.audio.prefs";
const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 180_000;

interface Prefs {
	voice: AudioVoice;
	playbackRate: number;
	volume: number;
}

function loadPrefs(): Prefs {
	if (typeof window === "undefined") return { voice: DEFAULT_VOICE, playbackRate: 1, volume: 1 };
	try {
		const raw = window.localStorage.getItem(PREFS_KEY);
		if (!raw) throw new Error("none");
		const p = JSON.parse(raw);
		return {
			voice: resolveVoice(p.voice),
			playbackRate: typeof p.playbackRate === "number" ? p.playbackRate : 1,
			volume: typeof p.volume === "number" ? p.volume : 1,
		};
	} catch {
		return { voice: DEFAULT_VOICE, playbackRate: 1, volume: 1 };
	}
}

/** Binary search: which segment contains this position? */
function segmentAt(segments: AudioSegment[], positionMs: number): AudioSegment | null {
	let lo = 0;
	let hi = segments.length - 1;
	while (lo <= hi) {
		const mid = (lo + hi) >> 1;
		const s = segments[mid];
		if (positionMs < s.startMs) hi = mid - 1;
		else if (positionMs >= s.endMs) lo = mid + 1;
		else return s;
	}
	return null;
}

async function ensureAsset(track: AudioTrack, voice: AudioVoice): Promise<AudioAsset> {
	const body =
		track.kind === "chapter"
			? { kind: "chapter", ...parseChapterKey(track.cacheKey), voice }
			: { kind: "step_intro", studyStepId: parseStepKey(track.cacheKey), voice, language: track.language };

	const res = await fetch("/api/audio/ensure", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.error ?? `HTTP_${res.status}`);
	}
	const { asset } = await res.json();
	if (!asset) throw new Error("NO_ASSET");
	return asset as AudioAsset;
}

/** `chapter:{bibleId}:{BOOK}:{n}:{voice}` */
function parseChapterKey(cacheKey: string) {
	const [, bibleId, bookAbbreviation, chapter] = cacheKey.split(":");
	return { bibleId, bookAbbreviation, chapterNumber: Number(chapter) };
}

/** `step:{studyStepId}:{voice}` */
function parseStepKey(cacheKey: string) {
	return cacheKey.split(":")[1];
}

/**
 * The single audio player for the entire app.
 *
 * Mounted at the ROOT layout, which is the only ancestor shared by the (app) tree
 * and the public /bible tree — and, crucially, the one React tree Next.js preserves
 * across client navigation. That is what lets audio keep playing while the user
 * moves between pages.
 *
 * HARD RULE: exactly one <audio> element, created once, never unmounted, never
 * recreated. iOS grants background/lock-screen playback to a media element started
 * by a user gesture and keeps that grant across `src` swaps on the SAME element.
 * Recreate the element and background auto-advance silently dies.
 *
 * Note this provider must NOT depend on LoggedUserContext or react-query: those
 * live under (app) only, and this sits above both trees. Premium is enforced
 * server-side in the ensure services, so nothing here needs to know about it.
 */
export function AudioPlayerProvider({ children }: { children: ReactNode }) {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const objectUrlRef = useRef<string | null>(null);

	const [queue, setQueue] = useState<AudioTrack[]>([]);
	const [index, setIndex] = useState(0);
	const [status, setStatus] = useState<AudioStatus>("idle");
	const [positionMs, setPositionMs] = useState(0);
	const [error, setError] = useState<string | null>(null);

	const [prefs, setPrefs] = useState<Prefs>({ voice: DEFAULT_VOICE, playbackRate: 1, volume: 1 });
	const [prefsLoaded, setPrefsLoaded] = useState(false);

	// Mirrors for native event handlers, which can't see fresh React state.
	// Deliberately few — everything else is derived, so there is no isPlayingRef-style
	// shadow state to keep in sync by hand.
	const queueRef = useRef<AudioTrack[]>([]);
	const indexRef = useRef(0);
	const listenedMsRef = useRef(0);

	const track = queue[index] ?? null;

	useEffect(() => { queueRef.current = queue; }, [queue]);
	useEffect(() => { indexRef.current = index; }, [index]);

	useEffect(() => {
		setPrefs(loadPrefs());
		setPrefsLoaded(true);
	}, []);

	useEffect(() => {
		if (!prefsLoaded) return;
		window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
	}, [prefs, prefsLoaded]);

	// ---- the one <audio> element ------------------------------------------------
	if (typeof window !== "undefined" && !audioRef.current) {
		audioRef.current = new Audio();
		audioRef.current.preload = "auto";
	}

	const applyTrackWindow = useCallback((audio: HTMLAudioElement, t: AudioTrack) => {
		if (t.startMs > 0) audio.currentTime = t.startMs / 1000;
	}, []);

	/** Resolves the asset (generating if needed) and points the element at it. */
	const prepareTrack = useCallback(
		async (t: AudioTrack, autoplay: boolean): Promise<void> => {
			const audio = audioRef.current;
			if (!audio) return;

			setError(null);
			setStatus("loading");

			try {
				let asset = await ensureAsset(t, prefs.voice);

				// Poll while the server synthesizes. Cheap: no generation is retriggered.
				const deadline = Date.now() + POLL_TIMEOUT_MS;
				while (asset.generationStatus === "generating" && Date.now() < deadline) {
					setStatus("generating");
					await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
					asset = await ensureAsset(t, prefs.voice);
				}

				if (asset.generationStatus === "failed") throw new Error(asset.error ?? "GENERATION_FAILED");
				if (asset.generationStatus !== "ready" || !asset.blobUrl) throw new Error("GENERATION_TIMEOUT");

				// Merge the resolved asset back into the queue so the UI gets real
				// segments/duration (the track was built before generation finished).
				const resolved: AudioTrack = {
					...t,
					status: "ready",
					url: asset.blobUrl,
					segments: asset.segments ?? [],
					durationMs: t.endMs > 0 ? t.endMs - t.startMs : (asset.durationMs ?? 0) - t.startMs,
				};
				setQueue((q) => q.map((item) => (item.cacheKey === t.cacheKey ? resolved : item)));

				// Prefer an offline copy when the user has downloaded this chapter.
				const src = (await getCachedAudioUrl(asset.blobUrl)) ?? asset.blobUrl;
				if (objectUrlRef.current) {
					URL.revokeObjectURL(objectUrlRef.current);
					objectUrlRef.current = null;
				}
				if (src.startsWith("blob:")) objectUrlRef.current = src;

				audio.src = src;
				audio.playbackRate = prefs.playbackRate;
				audio.volume = prefs.volume;
				listenedMsRef.current = 0;

				await new Promise<void>((resolve) => {
					const onReady = () => { audio.removeEventListener("loadedmetadata", onReady); resolve(); };
					audio.addEventListener("loadedmetadata", onReady);
					audio.load();
				});

				applyTrackWindow(audio, resolved);
				setPositionMs(0);
				setStatus("ready");

				if (autoplay) await audio.play();
			} catch (err) {
				const message = err instanceof Error ? err.message : String(err);
				setError(message);
				setStatus("error");
			}
		},
		[prefs.voice, prefs.playbackRate, prefs.volume, applyTrackWindow]
	);

	// ---- native media events ----------------------------------------------------
	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		let lastTime = 0;

		const onPlay = () => setStatus("playing");
		const onPause = () => setStatus((s) => (s === "playing" ? "paused" : s));

		const onTimeUpdate = () => {
			const t = queueRef.current[indexRef.current];
			if (!t) return;

			const absMs = audio.currentTime * 1000;
			setPositionMs(Math.max(0, absMs - t.startMs));

			// Accumulate real listening time (not wall-clock), so pauses don't inflate it.
			const delta = audio.currentTime - lastTime;
			if (delta > 0 && delta < 1 && !audio.paused) listenedMsRef.current += delta * 1000;
			lastTime = audio.currentTime;

			// A study step is a WINDOW into a chapter asset — end it at endMs rather
			// than waiting for the file's own `ended`.
			if (t.endMs > 0 && absMs >= t.endMs) void advance();
		};

		const onEnded = () => void advance();

		const onError = () => {
			setError("PLAYBACK_ERROR");
			setStatus("error");
		};

		const advance = async () => {
			const q = queueRef.current;
			const i = indexRef.current;
			const finished = q[i];

			if (finished) void onTrackComplete(finished, Math.round(listenedMsRef.current / 1000));

			if (i + 1 < q.length) {
				setIndex(i + 1);
				indexRef.current = i + 1;
				// Same element, media-event-originated => iOS allows this with the screen locked.
				await prepareTrack(q[i + 1], true);
			} else {
				audio.pause();
				setStatus("ready");
			}
		};

		audio.addEventListener("play", onPlay);
		audio.addEventListener("pause", onPause);
		audio.addEventListener("timeupdate", onTimeUpdate);
		audio.addEventListener("ended", onEnded);
		audio.addEventListener("error", onError);

		return () => {
			audio.removeEventListener("play", onPlay);
			audio.removeEventListener("pause", onPause);
			audio.removeEventListener("timeupdate", onTimeUpdate);
			audio.removeEventListener("ended", onEnded);
			audio.removeEventListener("error", onError);
		};
	}, [prepareTrack]);

	// ---- api --------------------------------------------------------------------
	const load = useCallback(
		async (nextQueue: AudioTrack[], opts?: { startIndex?: number }) => {
			const startIndex = opts?.startIndex ?? 0;
			setQueue(nextQueue);
			setIndex(startIndex);
			queueRef.current = nextQueue;
			indexRef.current = startIndex;
			if (nextQueue[startIndex]) await prepareTrack(nextQueue[startIndex], false);
		},
		[prepareTrack]
	);

	const play = useCallback(async () => {
		const audio = audioRef.current;
		if (!audio || !audio.src) return;
		await audio.play();
	}, []);

	const pause = useCallback(() => {
		audioRef.current?.pause();
	}, []);

	const toggle = useCallback(async () => {
		const audio = audioRef.current;
		if (!audio) return;
		if (audio.paused) await audio.play();
		else audio.pause();
	}, []);

	const seekMs = useCallback((ms: number) => {
		const audio = audioRef.current;
		const t = queueRef.current[indexRef.current];
		if (!audio || !t) return;
		const clamped = Math.max(0, Math.min(ms, t.durationMs));
		audio.currentTime = (t.startMs + clamped) / 1000;
		setPositionMs(clamped);
	}, []);

	const seekToVerse = useCallback(
		(verseNumber: number) => {
			const t = queueRef.current[indexRef.current];
			if (!t) return;
			const seg = t.segments.find((s) => s.verseNumber === verseNumber);
			if (seg) seekMs(seg.startMs - t.startMs);
		},
		[seekMs]
	);

	const nextTrack = useCallback(async () => {
		const i = indexRef.current;
		const q = queueRef.current;
		if (i + 1 >= q.length) return;
		setIndex(i + 1);
		indexRef.current = i + 1;
		await prepareTrack(q[i + 1], true);
	}, [prepareTrack]);

	const prevTrack = useCallback(async () => {
		const i = indexRef.current;
		const q = queueRef.current;
		if (i - 1 < 0) return;
		setIndex(i - 1);
		indexRef.current = i - 1;
		await prepareTrack(q[i - 1], true);
	}, [prepareTrack]);

	// Rate and volume apply to the live element — instant, position preserved.
	// (The old speechSynthesis player had to re-speak the verse from the start.)
	const setPlaybackRate = useCallback((rate: number) => {
		if (audioRef.current) audioRef.current.playbackRate = rate;
		setPrefs((p) => ({ ...p, playbackRate: rate }));
	}, []);

	const setVolume = useCallback((v: number) => {
		if (audioRef.current) audioRef.current.volume = v;
		setPrefs((p) => ({ ...p, volume: v }));
	}, []);

	const setVoice = useCallback((v: AudioVoice) => {
		setPrefs((p) => ({ ...p, voice: v }));
	}, []);

	const stop = useCallback(() => {
		const audio = audioRef.current;
		if (audio) {
			audio.pause();
			audio.removeAttribute("src");
			audio.load();
		}
		setQueue([]);
		setIndex(0);
		setStatus("idle");
		setPositionMs(0);
	}, []);

	const activeSegment = useMemo(() => {
		if (!track) return null;
		return segmentAt(track.segments, track.startMs + positionMs);
	}, [track, positionMs]);

	const value = useMemo<AudioPlayerApi>(
		() => ({
			queue,
			index,
			track,
			status,
			positionMs,
			durationMs: track?.durationMs ?? 0,
			activeSegment,
			activeVerseNumber: activeSegment?.verseNumber ?? null,
			playbackRate: prefs.playbackRate,
			volume: prefs.volume,
			voice: prefs.voice,
			error,
			load,
			play,
			pause,
			toggle,
			seekMs,
			seekToVerse,
			nextTrack,
			prevTrack,
			setPlaybackRate,
			setVolume,
			setVoice,
			stop,
		}),
		[
			queue, index, track, status, positionMs, activeSegment, prefs, error,
			load, play, pause, toggle, seekMs, seekToVerse, nextTrack, prevTrack,
			setPlaybackRate, setVolume, setVoice, stop,
		]
	);

	return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
}

/**
 * Persists progress when a track finishes.
 *
 * This lives in the player rather than in ListenMode on purpose: the whole point
 * of background audio is that a step can finish while the phone is locked and the
 * reader is unmounted. It also finally routes `timeSpentSeconds` into
 * session_step_completion — listen sessions have always written a null, because
 * SessionView's only call site invokes handleCompleteChapter() with no args.
 */
async function onTrackComplete(track: AudioTrack, timeSpentSeconds: number) {
	if (!track.sessionId || !track.stepId || !track.isLastChapterInStep) return;
	try {
		const { sessionStepCompletionCreateSS } = await import(
			"@/app/common/sessionStepCompletion/service/sessionStepCompletionCreateSS"
		);
		await sessionStepCompletionCreateSS({
			sessionId: track.sessionId,
			stepId: track.stepId,
			mode: "listen",
			timeSpentSeconds,
		});
	} catch {
		// Never let a stats write break playback.
	}
}

export function useAudioPlayer(): AudioPlayerApi {
	const ctx = useContext(AudioPlayerContext);
	if (!ctx) throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
	return ctx;
}

export function useOptionalAudioPlayer(): AudioPlayerApi | null {
	return useContext(AudioPlayerContext);
}
