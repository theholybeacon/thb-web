import { AnyPgColumn, index, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { userTable } from "./user";
import { bibleTable } from "./bible";

/**
 * A personal note anchored to a point in scripture.
 *
 * `targetType` says which level the note belongs to, and the anchor is stored as
 * a canonical reference (bookAbbreviation + chapter + verse) rather than as a FK
 * to a verse row — the same convention as entity_mention, session and study_step.
 * That means a note written on John 3:16 in the KJV surfaces when the user later
 * reads John 3:16 in any other translation.
 *
 * `bibleId` is the translation the note was written in: a soft pointer used to
 * link back, and the actual target for bible-scope notes (a thought about the
 * KJV itself does not belong to any other translation).
 *
 * The display fields (reference, bookName, bibleSlug, bookSlug) are denormalized
 * at write time so lists, search and back-links need no joins at all.
 */
export const noteTable = pgTable("note", {
	id: uuid().defaultRandom().primaryKey(),

	ownerId: uuid().references((): AnyPgColumn => userTable.id, { onDelete: "cascade" }).notNull(),

	targetType: varchar({ length: 10 }).notNull(), // bible | book | chapter | verse

	bibleId: uuid().references((): AnyPgColumn => bibleTable.id).notNull(),

	// Canonical anchor. Uppercased USFM abbreviation (book.apiId), null above its scope.
	bookAbbreviation: varchar({ length: 10 }),
	chapter: integer(),
	verse: integer(),

	// Denormalized for display and linking.
	reference: varchar({ length: 255 }),
	bookName: varchar({ length: 255 }),
	bibleSlug: varchar({ length: 100 }),
	bookSlug: varchar({ length: 100 }),

	title: varchar({ length: 255 }),
	content: text().notNull(),

	createdAt: timestamp().defaultNow(),
	updatedAt: timestamp().defaultNow(),
}, (table) => ({
	ownerIdx: index("note_owner_idx").on(table.ownerId),
	// "Everything I wrote on this chapter" — the reader's hot path.
	ownerChapterIdx: index("note_owner_chapter_idx").on(table.ownerId, table.bookAbbreviation, table.chapter),
	ownerBookIdx: index("note_owner_book_idx").on(table.ownerId, table.bookAbbreviation),
}));

export const noteRelations = relations(noteTable, ({ one }) => ({
	owner: one(userTable, {
		fields: [noteTable.ownerId],
		references: [userTable.id],
	}),
	bible: one(bibleTable, {
		fields: [noteTable.bibleId],
		references: [bibleTable.id],
	}),
}));

export const insertNoteSchema = createInsertSchema(noteTable);
export const selectNoteSchema = createSelectSchema(noteTable);
