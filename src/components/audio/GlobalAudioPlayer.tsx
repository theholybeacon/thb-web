"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Play, Pause, SkipBack, SkipForward, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioPlayer } from "@/app/state/AudioPlayerContext";
import { cn } from "@/lib/utils";

/**
 * Wires the player into the OS, and shows a mini-player when the user navigates
 * away from the reader.
 *
 * The Media Session block is what makes Listen Mode actually hands-free: lock-screen
 * artwork and transport, Bluetooth/headphone buttons, and car controls. Without it,
 * audio is something you have to stare at — which is what the old speechSynthesis
 * player was, since it stopped dead the moment an iPhone screen locked.
 */
export function GlobalAudioPlayer() {
	const t = useTranslations();
	const pathname = usePathname();
	const player = useAudioPlayer();
	const { track, status, positionMs, durationMs, playbackRate } = player;

	const lastPositionSync = useRef(0);

	// --- OS integration --------------------------------------------------------
	useEffect(() => {
		if (typeof navigator === "undefined" || !("mediaSession" in navigator) || !track) return;

		navigator.mediaSession.metadata = new MediaMetadata({
			title: track.title,
			artist: track.subtitle,
			album: "The Holy Beacon",
			artwork: [{ src: "/images/logo.png", sizes: "1024x1024", type: "image/png" }],
		});

		const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
			["play", () => void player.play()],
			["pause", () => player.pause()],
			["stop", () => player.stop()],
			["previoustrack", () => void player.prevTrack()],
			["nexttrack", () => void player.nextTrack()],
			["seekbackward", () => player.seekMs(Math.max(0, positionMs - 10_000))],
			["seekforward", () => player.seekMs(positionMs + 10_000)],
			[
				"seekto",
				(details) => {
					if (details.seekTime != null) player.seekMs(details.seekTime * 1000);
				},
			],
		];

		for (const [action, handler] of handlers) {
			try {
				navigator.mediaSession.setActionHandler(action, handler);
			} catch {
				// Not every browser supports every action; ignore the ones it doesn't.
			}
		}

		return () => {
			for (const [action] of handlers) {
				try {
					navigator.mediaSession.setActionHandler(action, null);
				} catch {
					/* noop */
				}
			}
		};
		// `positionMs` is intentionally excluded: re-registering handlers every tick
		// would thrash. The seek handlers read it via the closure refreshed on track change.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [track?.cacheKey, player]);

	useEffect(() => {
		if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
		navigator.mediaSession.playbackState =
			status === "playing" ? "playing" : status === "paused" ? "paused" : "none";
	}, [status]);

	// Keep the lock-screen scrubber in step, but only ~1/sec — timeupdate fires far
	// more often than that and setPositionState is not free.
	useEffect(() => {
		if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
		if (!durationMs || !navigator.mediaSession.setPositionState) return;
		if (Math.abs(positionMs - lastPositionSync.current) < 1000) return;
		lastPositionSync.current = positionMs;

		try {
			navigator.mediaSession.setPositionState({
				duration: durationMs / 1000,
				playbackRate,
				position: Math.min(positionMs, durationMs) / 1000,
			});
		} catch {
			/* Safari throws if position > duration mid-seek; harmless. */
		}
	}, [positionMs, durationMs, playbackRate]);

	// --- mini-player -----------------------------------------------------------
	// Hidden on the reader itself, which has its own full transport.
	const onReader = pathname.includes("/session/") || pathname.startsWith("/bible/");
	if (!track || status === "idle" || onReader) return null;

	const busy = status === "loading" || status === "generating";
	const progress = durationMs > 0 ? (positionMs / durationMs) * 100 : 0;

	return (
		<div className="fixed bottom-0 inset-x-0 z-50 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
			<div className="h-0.5 bg-muted">
				<div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
			</div>

			<div className="max-w-4xl mx-auto flex items-center gap-3 px-4 py-2">
				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium">{track.title}</p>
					<p className="truncate text-xs text-muted-foreground">
						{busy ? t("audio.preparing") : track.subtitle}
					</p>
				</div>

				<Button variant="ghost" size="icon" onClick={() => void player.prevTrack()} disabled={player.index === 0}>
					<SkipBack className="h-4 w-4" />
				</Button>

				<Button size="icon" className="rounded-full" onClick={() => void player.toggle()} disabled={busy}>
					{busy ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : status === "playing" ? (
						<Pause className="h-4 w-4" />
					) : (
						<Play className={cn("h-4 w-4", "ml-0.5")} />
					)}
				</Button>

				<Button
					variant="ghost"
					size="icon"
					onClick={() => void player.nextTrack()}
					disabled={player.index >= player.queue.length - 1}
				>
					<SkipForward className="h-4 w-4" />
				</Button>

				<Button variant="ghost" size="icon" onClick={player.stop} aria-label={t("audio.close")}>
					<X className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
