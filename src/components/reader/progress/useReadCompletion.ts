"use client";

import { useEffect, useRef } from "react";
import { requiredDwellSeconds } from "@/lib/completionClient";
import { useOptionalChapterCompletion } from "./ChapterCompletionContext";

/**
 * Marks a chapter read once the reader has both reached the end of it and spent
 * a plausible amount of time on it.
 *
 * Reading is the one mode with no natural completion event — Type finishes when
 * the text is typed, Listen when the audio ends, but scrolling tells you almost
 * nothing on its own. Requiring *both* signals is what keeps this honest: dwell
 * alone would credit a chapter left open in a background tab, and reaching the
 * bottom alone would credit a flick of the scrollbar (or a short chapter that
 * fits on screen with no scrolling at all).
 *
 * Dwell only accrues while the tab is actually visible, so a chapter left open
 * overnight earns nothing.
 *
 * @param lastVerseRef element to observe — the final verse of the chapter
 * @param verseCount   scales the dwell requirement to the chapter's length
 * @param ready        false while verses are still loading
 */
export function useReadCompletion(
	lastVerseRef: React.RefObject<HTMLElement | null>,
	verseCount: number,
	ready: boolean,
): void {
	const completion = useOptionalChapterCompletion();
	const markComplete = completion?.markComplete;

	const dwellMsRef = useRef(0);
	const reachedEndRef = useRef(false);
	const doneRef = useRef(false);

	// Reset the counters whenever the passage changes, so time spent on the
	// previous chapter never carries over to this one.
	useEffect(() => {
		dwellMsRef.current = 0;
		reachedEndRef.current = false;
		doneRef.current = false;
	}, [verseCount, lastVerseRef]);

	useEffect(() => {
		if (!ready || !markComplete || verseCount === 0) return;

		const requiredMs = requiredDwellSeconds(verseCount) * 1000;
		const el = lastVerseRef.current;

		const observer = el
			? new IntersectionObserver(
					(entries) => {
						for (const entry of entries) {
							if (entry.isIntersecting) reachedEndRef.current = true;
						}
					},
					// A sliver of the last verse counts as reaching the end; requiring it
					// fully on screen fails when the verse is taller than the viewport.
					{ threshold: 0.1 },
				)
			: null;
		if (observer && el) observer.observe(el);

		const TICK_MS = 1000;
		const timer = window.setInterval(() => {
			if (doneRef.current) return;
			if (document.visibilityState !== "visible") return;

			dwellMsRef.current += TICK_MS;
			if (dwellMsRef.current < requiredMs) return;
			if (!reachedEndRef.current) return;

			doneRef.current = true;
			markComplete("read", Math.round(dwellMsRef.current / 1000));
		}, TICK_MS);

		return () => {
			window.clearInterval(timer);
			observer?.disconnect();
		};
	}, [ready, markComplete, verseCount, lastVerseRef]);
}
