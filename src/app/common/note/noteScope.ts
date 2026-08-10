/**
 * Scope helpers for notes. Kept free of any drizzle/db imports so it can be
 * safely imported from client components.
 */

export const NOTE_CONTENT_MAX_LENGTH = 10000;
export const NOTE_TITLE_MAX_LENGTH = 255;

export const NOTE_TARGET_TYPES = ["bible", "book", "chapter", "verse"] as const;

export type NoteTargetType = (typeof NOTE_TARGET_TYPES)[number];

export function isNoteTargetType(value: string): value is NoteTargetType {
	return (NOTE_TARGET_TYPES as readonly string[]).includes(value);
}

/** Broadest scope first, so lists read bible -> book -> chapter -> verse. */
export const NOTE_TARGET_ORDER: Record<NoteTargetType, number> = {
	bible: 0,
	book: 1,
	chapter: 2,
	verse: 3,
};

/** Minimal shape needed to link a note back to the passage it was written on. */
export interface NoteScriptureAnchor {
	bibleSlug?: string | null;
	bookSlug?: string | null;
	chapter?: number | null;
	verse?: number | null;
}

/**
 * Builds the reader URL a note points at, or null when the note is not
 * reachable (e.g. written against a translation that has since been removed).
 */
export function buildNoteHref(note: NoteScriptureAnchor): string | null {
	if (!note.bibleSlug) return null;
	if (!note.bookSlug) return `/bible/${note.bibleSlug}`;
	if (!note.chapter) return `/bible/${note.bibleSlug}/${note.bookSlug}`;

	const base = `/bible/${note.bibleSlug}/${note.bookSlug}/${note.chapter}`;

	return note.verse ? `${base}#verse-${note.verse}` : base;
}
