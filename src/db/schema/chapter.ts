import { integer, pgTable, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import { bookTable } from "./book";
import { verseTable } from "./verse";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const chapterTable = pgTable("chapter", {
	id: uuid().defaultRandom().primaryKey(),
	bookId: uuid().notNull(),
	chapterNumber: integer().notNull(),
	/**
	 * Verse count as api.bible reports it, written when the chapter is hydrated.
	 * A row holding fewer verses than this is incomplete and re-fetches on read.
	 * -1 means upstream has no such chapter — deliberately empty, never retried.
	 */
	numVerses: integer().default(0),
	/**
	 * sha256 of this chapter's verse text; see src/lib/chapterHash.ts.
	 *
	 * Lets every Bible row carrying the same words share one narration — the canon
	 * variants of a translation (Protestant/Catholic/Orthodox/Ecumenical) hold
	 * identical text for the books they share. Null when the verse fetch was
	 * incomplete, in which case audio falls back to the bibleId-based cache key.
	 */
	contentHash: varchar({ length: 64 }),
	createdAt: timestamp().defaultNow(),
	updatedAt: timestamp().defaultNow(),
}, (t) => ({
	// Two readers racing to hydrate a cold chapter used to mint two rows, and
	// the verses would land on whichever one the reader did not get back.
	uniqueChapter: unique("chapter_book_number_unique").on(t.bookId, t.chapterNumber),
}));

export const chapterRelations = relations(chapterTable, ({ one, many }) => ({
	book: one(bookTable, {
		fields: [chapterTable.bookId],
		references: [bookTable.id],
	}),
	verses: many(verseTable),
}));

export const insertChapterSchema = createInsertSchema(chapterTable);
export const selectChapterSchema = createSelectSchema(chapterTable);
