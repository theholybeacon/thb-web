import { integer, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import { chapterTable } from "./chapter";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const verseTable = pgTable("verse", {
	id: uuid().defaultRandom().primaryKey(),
	chapterId: uuid().notNull(),
	verseNumber: integer().notNull(),
	/**
	 * Stored verbatim from api.bible's `content-type=text` output — the
	 * whitespace is load-bearing, see src/app/common/verse/model/verseLayout.ts.
	 * `text` rather than varchar(1000): a longer verse used to throw on insert
	 * and truncate the whole chapter.
	 */
	content: text().notNull(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
}, (t) => ({
	// Concurrent hydration of the same chapter must not double its verses.
	uniqueVerse: unique("verse_chapter_number_unique").on(t.chapterId, t.verseNumber),
}));

export const verseRelations = relations(verseTable, ({ one }) => ({
	chapter: one(chapterTable, {
		fields: [verseTable.chapterId],
		references: [chapterTable.id],
	}),
}));

export const insertVerseSchema = createInsertSchema(verseTable);
export const selectVerseSchema = createSelectSchema(verseTable);
