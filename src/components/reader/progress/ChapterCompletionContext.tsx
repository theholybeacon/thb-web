"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
	type ReactNode,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { chapterCompletionRecordSS } from "@/app/common/completion/service/server/chapterCompletionRecordSS";
import { chapterCompletionStatusGetSS } from "@/app/common/completion/service/server/chapterCompletionStatusGetSS";
import type { CompletionMode } from "@/app/common/completion/model/Completion";
import { localDateString } from "@/lib/activityClient";

export type ChapterCompletionApi = {
	/** Modes this chapter has been finished in, in ANY translation. */
	completedModes: CompletionMode[];
	/** Times the chapter has been completed end to end, across all translations. */
	times: number;
	/** Times completed in the translation currently open. */
	timesInThisBible: number;
	/** Modes it has been finished in within the translation currently open. */
	modesInThisBible: CompletionMode[];
	/** True once any mode has completed it — drives the reader's check control. */
	isComplete: boolean;
	/** True once it has been completed in THIS translation. */
	isCompleteInThisBible: boolean;
	/** Whether we know the answer yet (false while the initial status loads). */
	loaded: boolean;
	/** Record a completion. Idempotent per mode for the life of this chapter view. */
	markComplete: (mode: CompletionMode, secondsSpent?: number) => void;
	/** Fired when a badge is earned, so the UI can celebrate at the right moment. */
	newBadges: string[];
	clearNewBadges: () => void;
};

const ChapterCompletionContext = createContext<ChapterCompletionApi | null>(null);

type ProviderProps = {
	children: ReactNode;
	/** Canonical anchor. Without it the provider is inert (nothing to record against). */
	bookAbbreviation?: string;
	chapterNumber?: number;
	bibleId?: string;
};

/**
 * Tracks whether the chapter currently open has been completed, and records it
 * when a mode says so.
 *
 * This deliberately mirrors SessionProgressContext but is mounted in
 * ReaderEngine, so it is present on BOTH reading surfaces. The session context
 * is null in the public reader, which is why reading a chapter from /bible/...
 * has never counted toward anything.
 *
 * Keyed on the canonical ref AND the translation rather than mount, because
 * paging chapters inside a study session does not always remount the reader —
 * and because progress is per-translation: switching Bible on the same chapter
 * is a different question with a different answer, and a key that ignored it
 * would leave the mode marked as already sent and silently record nothing.
 */
export function ChapterCompletionProvider({
	children,
	bookAbbreviation,
	chapterNumber,
	bibleId,
}: ProviderProps) {
	const [completedModes, setCompletedModes] = useState<CompletionMode[]>([]);
	const [modesInThisBible, setModesInThisBible] = useState<CompletionMode[]>([]);
	const [times, setTimes] = useState(0);
	const [timesInThisBible, setTimesInThisBible] = useState(0);
	const [loaded, setLoaded] = useState(false);
	const [newBadges, setNewBadges] = useState<string[]>([]);

	// Anonymous readers have nowhere to record progress. Gating here (rather than
	// only server-side) keeps the public reader — the SEO surface, mostly logged
	// out — from making a status round trip on every chapter view.
	const { isSignedIn } = useAuth();
	const anchored = Boolean(bookAbbreviation && chapterNumber);
	const active = anchored && Boolean(isSignedIn);

	// Modes already sent for THIS chapter, so a mode that keeps reporting
	// "complete" on every render only ever produces one request.
	const sentRef = useRef<Set<string>>(new Set());
	const chapterKey = `${bookAbbreviation ?? ""}:${chapterNumber ?? ""}:${bibleId ?? ""}`;

	useEffect(() => {
		sentRef.current = new Set();
		setCompletedModes([]);
		setModesInThisBible([]);
		setTimes(0);
		setTimesInThisBible(0);
		setLoaded(false);

		if (!active) {
			setLoaded(true);
			return;
		}

		let cancelled = false;
		void (async () => {
			try {
				const status = await chapterCompletionStatusGetSS(
					bookAbbreviation!,
					chapterNumber!,
					bibleId ?? null,
				);
				if (cancelled) return;
				setCompletedModes(status.completedModes);
				setModesInThisBible(status.modesInThisBible);
				setTimes(status.times);
				setTimesInThisBible(status.timesInThisBible);
			} catch {
				// Best effort: an unknown state simply shows as "not yet complete".
			} finally {
				if (!cancelled) setLoaded(true);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [chapterKey, active, bookAbbreviation, chapterNumber, bibleId]);

	const markComplete = useCallback(
		(mode: CompletionMode, secondsSpent?: number) => {
			if (!active) return;
			if (sentRef.current.has(mode)) return;
			sentRef.current.add(mode);

			void (async () => {
				try {
					const res = await chapterCompletionRecordSS({
						bookAbbreviation: bookAbbreviation!,
						chapter: chapterNumber!,
						mode,
						bibleId: bibleId ?? null,
						secondsSpent: secondsSpent ?? null,
						localDate: localDateString(),
					});
					if (!res.ok) {
						// Let a later attempt retry (e.g. the user signs in mid-session).
						sentRef.current.delete(mode);
						return;
					}
					setCompletedModes((prev) => (prev.includes(mode) ? prev : [...prev, mode]));
					setModesInThisBible((prev) => (prev.includes(mode) ? prev : [...prev, mode]));
					// One recorded row is one more pass at BOTH zoom levels. `res.lap` is
					// the pass number within this translation only, so it cannot stand in
					// for the all-translations count.
					if (res.lap > 0) {
						setTimes((prev) => prev + 1);
						setTimesInThisBible((prev) => Math.max(prev + 1, res.lap));
					}
					if (res.newBadges.length > 0 || res.newBibleBadges.length > 0) {
						// Both zoom levels celebrate together; the keys are the same i18n
						// keys, so a badge earned at both at once is shown once.
						setNewBadges(Array.from(new Set([...res.newBadges, ...res.newBibleBadges])));
					}
				} catch {
					sentRef.current.delete(mode);
				}
			})();
		},
		[active, bookAbbreviation, chapterNumber, bibleId],
	);

	const clearNewBadges = useCallback(() => setNewBadges([]), []);

	const value: ChapterCompletionApi = {
		completedModes,
		modesInThisBible,
		times,
		timesInThisBible,
		isComplete: completedModes.length > 0,
		isCompleteInThisBible: modesInThisBible.length > 0,
		loaded,
		markComplete,
		newBadges,
		clearNewBadges,
	};

	return (
		<ChapterCompletionContext.Provider value={value}>{children}</ChapterCompletionContext.Provider>
	);
}

/** Null outside a reader — callers must treat completion tracking as optional. */
export function useOptionalChapterCompletion(): ChapterCompletionApi | null {
	return useContext(ChapterCompletionContext);
}
