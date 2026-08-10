import { noteTable } from "@/db/schema/note";
import { NoteTargetType } from "../noteScope";

export type NoteInsert = typeof noteTable.$inferInsert;
export type Note = typeof noteTable.$inferSelect;

/**
 * What the client sends when writing a note: the level it is anchored at plus
 * the canonical coordinates of that level. The display fields and validation
 * are resolved server-side by `resolveNoteTarget`.
 */
export interface NoteTargetInput {
	targetType: NoteTargetType;
	bibleId: string;
	/** Canonical USFM abbreviation (book.apiId). Required for book/chapter/verse. */
	bookAbbreviation?: string | null;
	/** Required for chapter/verse. */
	chapter?: number | null;
	/** Required for verse. */
	verse?: number | null;
}

export interface NoteCreateInput extends NoteTargetInput {
	title?: string | null;
	content: string;
}

export interface NoteUpdateInput {
	id: string;
	title?: string | null;
	content: string;
}
