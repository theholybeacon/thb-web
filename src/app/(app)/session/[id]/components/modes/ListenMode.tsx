"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Verse } from "@/app/common/verse/model/Verse";
import { EntityLite } from "@/app/common/entity/model/Entity";
import { useOptionalSessionProgress } from "../../context/SessionProgressContext";
import { useOptionalChapterCompletion } from "@/components/reader/progress/ChapterCompletionContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
	Play, Pause, SkipBack, SkipForward, Volume2, Gauge, Loader2, Lock, Info, Download, Check,
} from "lucide-react";
import { AiContent } from "@/components/entity/AiContent";
import { parseChapterBlocks } from "@/app/common/verse/model/verseLayout";
import { ChapterText } from "@/components/reader/ChapterText";
import { keepVerseAnchorInBand } from "@/components/reader/scrollToVerse";
import { useAudioPlayer } from "@/app/state/AudioPlayerContext";
import {
	AUDIO_VOICES, AudioTrack, AudioVoice, VOICE_LABEL_KEY, chapterCacheKey, stepIntroCacheKey,
} from "@/app/common/audio/model/AudioAsset";
import { cacheAudio, isAudioCached } from "@/lib/audioCache";
import { toast } from "@/lib/toast";

interface ListenModeProps {
	verses: Verse[];
	startVerse?: number | null;
	endVerse?: number | null;
	bookName?: string;
	chapterNumber?: number;
	bibleLanguage?: string;
	explanation?: string | null;
	/** People mentioned in each verse, for inline character links. */
	mentionsByVerse?: Record<number, EntityLite[]>;

	/** Required for scripture narration. Without it, only our own content is narrated. */
	bibleId?: string;
	bookAbbreviation?: string;
	/** False for copyrighted translations — see src/lib/bibleLicense.ts. */
	audioEnabled?: boolean;
	isPremium?: boolean;

	/** Study context: lets the player persist completion even with the screen locked. */
	studyStepId?: string;
	sessionId?: string;
	isLastChapterInStep?: boolean;
	onUpgradeClick?: () => void;
	/** The reader's scroll container, owned by ReaderEngine. */
	scrollerRef?: React.RefObject<HTMLDivElement | null>;
}

function formatTime(ms: number): string {
	const total = Math.max(0, Math.round(ms / 1000));
	const m = Math.floor(total / 60);
	const s = total % 60;
	return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Listen Mode: a view over the global audio player.
 *
 * It owns no playback state of its own. Everything — the <audio> element, the
 * queue, position, auto-advance — lives in AudioPlayerContext at the root layout,
 * so audio keeps playing when this component unmounts (navigating away, locking
 * the phone). That inversion is the whole point of the rewrite: the old version
 * drove window.speechSynthesis from component state and died the moment the
 * screen went dark.
 */
export function ListenMode({
	verses,
	startVerse,
	endVerse,
	bookName,
	chapterNumber,
	bibleLanguage,
	explanation,
	mentionsByVerse,
	bibleId,
	bookAbbreviation,
	audioEnabled = false,
	isPremium = false,
	studyStepId,
	sessionId,
	isLastChapterInStep,
	onUpgradeClick,
	scrollerRef,
}: ListenModeProps) {
	const t = useTranslations();
	const player = useAudioPlayer();
	const sessionProgress = useOptionalSessionProgress();
	const chapterCompletion = useOptionalChapterCompletion();

	const verseAnchors = useRef<Record<number, HTMLElement | null>>({});
	const [downloaded, setDownloaded] = useState(false);

	const filteredVerses = useMemo(
		() =>
			verses
				.filter((v) => {
					if (!startVerse) return true;
					return v.verseNumber >= startVerse && v.verseNumber <= (endVerse ?? startVerse);
				})
				.sort((a, b) => a.verseNumber - b.verseNumber),
		[verses, startVerse, endVerse]
	);

	const canNarrateScripture = Boolean(isPremium && audioEnabled && bibleId && bookAbbreviation && chapterNumber);

	const blocks = useMemo(() => parseChapterBlocks(filteredVerses), [filteredVerses]);

	// Build the listening queue: our own step intro first, then the scripture.
	// A step is a WINDOW into the shared chapter asset, so one cached chapter serves
	// every study step that touches it.
	const tracks = useMemo<AudioTrack[]>(() => {
		if (!isPremium) return [];
		const voice = player.voice;
		const out: AudioTrack[] = [];
		const reference = `${bookName ?? ""} ${chapterNumber ?? ""}`.trim();

		if (studyStepId) {
			out.push({
				cacheKey: stepIntroCacheKey(studyStepId, voice),
				kind: "step_intro",
				status: "pending",
				url: null,
				segments: [],
				startMs: 0,
				endMs: 0,
				durationMs: 0,
				title: t("audio.introduction"),
				subtitle: reference,
				downloadable: false,
				language: bibleLanguage,
				sessionId,
				stepId: studyStepId,
				isLastChapterInStep: false,
			});
		}

		if (canNarrateScripture) {
			out.push({
				cacheKey: chapterCacheKey(bibleId!, bookAbbreviation!, chapterNumber!, voice),
				kind: "chapter",
				status: "pending",
				url: null,
				segments: [],
				// Resolved to the exact verse offsets once the asset is ready.
				startMs: 0,
				endMs: 0,
				durationMs: 0,
				title: reference,
				subtitle: bookName ?? "",
				downloadable: true,
				language: bibleLanguage,
				sessionId,
				stepId: studyStepId,
				isLastChapterInStep: isLastChapterInStep ?? true,
				// Lets the player record the completion itself when the track ends with
				// the screen locked and this component long unmounted.
				bookAbbreviation: bookAbbreviation!,
				chapterNumber: chapterNumber!,
				bibleId: bibleId!,
			});
		}

		return out;
	}, [
		isPremium, canNarrateScripture, player.voice, bibleId, bookAbbreviation, chapterNumber,
		bookName, bibleLanguage, studyStepId, sessionId, isLastChapterInStep, t,
	]);

	// Load the queue whenever the passage or the voice changes.
	useEffect(() => {
		if (tracks.length === 0) return;
		void player.load(tracks);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tracks]);

	const activeVerse = player.activeVerseNumber;

	// Keep the spoken verse on screen. The old player never did this, so on a long
	// chapter the highlight simply walked off the bottom and you had to chase it.
	// Now that the text flows, a screenful holds a dozen verses — so only scroll
	// when the active one drifts out of a comfortable band, not on every verse.
	useEffect(() => {
		if (activeVerse == null) return;
		keepVerseAnchorInBand(scrollerRef?.current ?? null, verseAnchors.current[activeVerse] ?? null);
	}, [activeVerse, scrollerRef]);

	useEffect(() => {
		const idx = activeVerse ? filteredVerses.findIndex((v) => v.verseNumber === activeVerse) : 0;
		const done = player.status === "ready" && player.positionMs > 0 && player.positionMs >= player.durationMs;
		sessionProgress?.reportModeProgress(Math.max(0, idx), filteredVerses.length, done);
		// Reflect completion in the reader straight away. The player writes this too
		// (it has to — audio finishes with the screen locked), but only this path
		// runs while the user is looking at the page. The server's re-completion
		// cooldown makes the overlap a no-op rather than a second lap.
		if (done) chapterCompletion?.markComplete("listen");
	}, [activeVerse, filteredVerses, player.status, player.positionMs, player.durationMs, sessionProgress, chapterCompletion]);

	useEffect(() => {
		if (player.track?.url) void isAudioCached(player.track.url).then(setDownloaded);
	}, [player.track?.url]);

	const handleDownload = async () => {
		if (!player.track?.url) return;
		try {
			await cacheAudio(player.track.url);
			setDownloaded(true);
			toast.success(t("audio.downloaded"));
		} catch {
			toast.error(t("audio.downloadFailed"));
		}
	};

	/*
	 * Inline-safe highlighting. The old treatment (scale + block padding + a
	 * negative margin) cannot work on flowing text: transforms do nothing to a
	 * non-atomic inline box, and padding would only land on the first and last
	 * line fragments. `box-decoration-clone` gives every wrapped fragment its own
	 * rounded pill, and the padding is cancelled by an equal negative margin so
	 * the paragraph does not reflow as the highlight advances.
	 */
	const verseClassName = useCallback(
		(verseNumber: number) => {
			if (verseNumber === activeVerse) {
				return "bg-primary/15 text-foreground rounded-[3px] px-[0.15em] -mx-[0.15em] box-decoration-clone";
			}
			if (activeVerse != null && verseNumber < activeVerse) return "text-foreground";
			return "text-muted-foreground/50";
		},
		[activeVerse],
	);

	const busy = player.status === "loading" || player.status === "generating";
	const isPlaying = player.status === "playing";

	// --- gates -----------------------------------------------------------------
	if (!isPremium) {
		return (
			<div className="max-w-4xl mx-auto w-full py-16 text-center">
				<Lock className="h-10 w-10 mx-auto text-muted-foreground/40 mb-4" />
				<h3 className="text-lg font-semibold mb-2">{t("audio.premiumTitle")}</h3>
				<p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">{t("audio.premiumBody")}</p>
				<Button onClick={onUpgradeClick}>{t("premium.upgrade")}</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col min-h-full">
			<div className="flex-1 max-w-4xl mx-auto w-full space-y-6">
				{explanation && (
					<AiContent>
						<p className="text-sm leading-relaxed italic text-muted-foreground">{explanation}</p>
					</AiContent>
				)}

				{bookName && chapterNumber && (
					<div className="text-center pb-4 border-b">
						<h2 className="text-2xl font-serif font-semibold">
							{bookName} {chapterNumber}
							{startVerse && `:${startVerse}${endVerse && endVerse !== startVerse ? `-${endVerse}` : ""}`}
						</h2>
					</div>
				)}

				{/* Copyrighted translation: we may narrate our own words, not the text. */}
				{!audioEnabled && (
					<div className="flex gap-3 rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
						<Info className="h-4 w-4 shrink-0 mt-0.5" />
						<p>{t("audio.notLicensed")}</p>
					</div>
				)}

				{player.status === "error" && (
					<div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
						{t("audio.playbackError")}
					</div>
				)}

				<div className="pb-32">
					<ChapterText
						blocks={blocks}
						mentionsByVerse={mentionsByVerse}
						verseClassName={verseClassName}
						onVerseClick={canNarrateScripture ? player.seekToVerse : undefined}
						registerVerseAnchor={(verseNumber, el) => {
							verseAnchors.current[verseNumber] = el;
						}}
					/>
				</div>
			</div>

			{/* Transport */}
			<div className="sticky bottom-0 -mx-3 md:-mx-6 -mb-3 md:-mb-6 bg-card border-t shadow-lg p-4">
				<div className="max-w-4xl mx-auto space-y-3">
					{/* A real, seekable, time-based timeline — the old one was a display-only
					    div that could only step verse-by-verse. */}
					<div className="space-y-1">
						<Slider
							value={[player.positionMs]}
							onValueChange={([v]) => player.seekMs(v)}
							min={0}
							max={Math.max(player.durationMs, 1)}
							step={100}
							disabled={busy || player.durationMs === 0}
						/>
						<div className="flex justify-between text-xs text-muted-foreground">
							<span>{formatTime(player.positionMs)}</span>
							<span>
								{busy
									? t("audio.preparing")
									: `${formatTime(player.durationMs)}`}
							</span>
						</div>
					</div>

					<div className="flex items-center justify-center gap-4">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => void player.prevTrack()}
							disabled={player.index === 0 || busy}
						>
							<SkipBack className="h-5 w-5" />
						</Button>

						<Button
							size="lg"
							className="h-14 w-14 rounded-full"
							onClick={() => void player.toggle()}
							disabled={busy || player.queue.length === 0}
						>
							{busy ? (
								<Loader2 className="h-6 w-6 animate-spin" />
							) : isPlaying ? (
								<Pause className="h-6 w-6" />
							) : (
								<Play className="h-6 w-6 ml-1" />
							)}
						</Button>

						<Button
							variant="ghost"
							size="icon"
							onClick={() => void player.nextTrack()}
							disabled={player.index >= player.queue.length - 1 || busy}
						>
							<SkipForward className="h-5 w-5" />
						</Button>
					</div>

					{/* Speed: audio.playbackRate — applies instantly, position preserved.
					    The old player had to re-speak the verse from the beginning. */}
					<div className="flex items-center gap-4 px-4">
						<Gauge className="h-4 w-4 text-muted-foreground" />
						<span className="text-sm text-muted-foreground min-w-[60px]">{t("session.speed")}</span>
						<Slider
							value={[player.playbackRate]}
							onValueChange={([v]) => player.setPlaybackRate(v)}
							min={0.5}
							max={2}
							step={0.05}
							className="flex-1"
						/>
						<span className="text-sm font-mono min-w-[40px]">{player.playbackRate.toFixed(1)}x</span>
					</div>

					<div className="flex items-center gap-4 px-4">
						<Volume2 className="h-4 w-4 text-muted-foreground" />
						<span className="text-sm text-muted-foreground min-w-[60px]">{t("session.volume")}</span>
						<Slider
							value={[player.volume]}
							onValueChange={([v]) => player.setVolume(v)}
							min={0}
							max={1}
							step={0.05}
							className="flex-1"
						/>
						<span className="text-sm font-mono min-w-[40px]">{Math.round(player.volume * 100)}%</span>
					</div>

					<div className="flex items-center justify-between gap-2 px-4">
						<div className="flex items-center gap-1">
							{AUDIO_VOICES.map((v: AudioVoice) => (
								<Button
									key={v}
									size="sm"
									variant={player.voice === v ? "secondary" : "ghost"}
									className="h-7 px-2 text-xs"
									onClick={() => player.setVoice(v)}
								>
									{t(`audio.${VOICE_LABEL_KEY[v]}`)}
								</Button>
							))}
						</div>

						{player.track?.downloadable && player.track.url && (
							<Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs" onClick={handleDownload} disabled={downloaded}>
								{downloaded ? <Check className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
								{downloaded ? t("audio.downloaded") : t("audio.download")}
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
