"use client";

/** Matches the `scroll-mt-24` on the verse anchors in ChapterText. */
const ANCHOR_OFFSET_PX = 96;

function prefersReducedMotion(): boolean {
	return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Scrolls a verse anchor to the top of the reader column.
 *
 * The reader scrolls inside a nested `overflow-y-auto` div rather than the
 * document, and the anchor is a zero-size inline box — `scrollIntoView` on that
 * combination lands the anchor under the sticky toolbar, so the offset is
 * computed by hand.
 */
export function scrollVerseAnchorToTop(scroller: HTMLElement | null, anchor: HTMLElement | null): void {
	if (!scroller || !anchor) return;
	const top =
		anchor.getBoundingClientRect().top -
		scroller.getBoundingClientRect().top +
		scroller.scrollTop -
		ANCHOR_OFFSET_PX;
	scroller.scrollTo({ top: Math.max(0, top), behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

/**
 * Keeps a verse inside a comfortable reading band, scrolling only when it falls
 * outside.
 *
 * Used to follow narration. Re-centring on every verse used to be fine when each
 * verse was its own tall block, but a screenful of flowing text holds a dozen
 * verses — centring each one in turn is a constant crawl.
 */
export function keepVerseAnchorInBand(scroller: HTMLElement | null, anchor: HTMLElement | null): void {
	if (!scroller || !anchor) return;
	const box = scroller.getBoundingClientRect();
	const rect = anchor.getBoundingClientRect();
	const bandTop = box.top + box.height * 0.25;
	const bandBottom = box.top + box.height * 0.7;
	if (rect.top >= bandTop && rect.top <= bandBottom) return;

	// A third of the way down, not half: you read ahead of the narrator, so the
	// text below the active verse is the part that needs to be on screen.
	const top = rect.top - box.top + scroller.scrollTop - box.height * 0.35;
	scroller.scrollTo({ top: Math.max(0, top), behavior: prefersReducedMotion() ? "auto" : "smooth" });
}
