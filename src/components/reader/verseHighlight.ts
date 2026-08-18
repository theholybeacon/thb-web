/**
 * Verse highlighting — marking one verse or a short passage inside a chapter
 * that is otherwise shown whole.
 *
 * The reader has always had one way to say "this is the part that matters":
 * dim everything else. That reads well for a long passage, but for a single
 * verse it greys out an entire chapter to point at one line. Highlighting
 * inverts it — the surrounding text stays fully legible as context, and the
 * reference itself is what carries the mark.
 */

export interface VerseRange {
	start: number;
	end: number;
}

/**
 * Above this many verses a passage stops being "a couple of verses": the mark
 * spreads over most of the screen and stops reading as an accent, so the range
 * is better shown by dimming what falls outside it.
 */
export const HIGHLIGHT_MAX_VERSES = 5;

/** The mark itself. See `.bible-verse-highlight` in globals.css. */
export const VERSE_HIGHLIGHT_CLASS = "bible-verse-highlight text-foreground";

/** Normalises the reader's `startVerse`/`endVerse` pair into a range. */
export function toVerseRange(start?: number | null, end?: number | null): VerseRange | null {
	if (start == null) return null;
	const last = end ?? start;
	return { start, end: Math.max(start, last) };
}

export function verseRangeLength(range: VerseRange): number {
	return range.end - range.start + 1;
}

export function isShortRange(range: VerseRange): boolean {
	return verseRangeLength(range) <= HIGHLIGHT_MAX_VERSES;
}

export function rangeIncludes(range: VerseRange | null, verseNumber: number): boolean {
	return range != null && verseNumber >= range.start && verseNumber <= range.end;
}

/**
 * Parses a reader deep link: `#verse-16` for one verse, `#verse-16-18` for a
 * passage. Anything else — including the `#verse-18-16` a hand-written link
 * might carry — is normalised or rejected here rather than at the call sites.
 */
export function parseVerseHash(hash: string): VerseRange | null {
	const match = /^#verse-(\d+)(?:-(\d+))?$/.exec(hash);
	if (!match) return null;
	const start = Number(match[1]);
	if (!Number.isFinite(start) || start < 1) return null;
	const end = match[2] ? Number(match[2]) : start;
	if (!Number.isFinite(end) || end < start) return { start, end: start };
	return { start, end };
}

/** Builds the `#verse-…` fragment for a verse or passage. */
export function verseHash(start: number, end?: number | null): string {
	return end != null && end > start ? `#verse-${start}-${end}` : `#verse-${start}`;
}
