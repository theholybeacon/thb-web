import { integer, pgTable, timestamp, uuid, } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import { bookTable } from "./book";
import { verseTable } from "./verse";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const chapterTable = pgTable("chapter", {
	id: uuid().defaultRandom().primaryKey(),
	bookId: uuid().notNull(),
	chapterNumber: integer().notNull(),
	numVerses: integer().notNull(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
});

export const chapterRelations = relations(chapterTable, ({ one, many }) => ({
	book: one(bookTable, {
		fields: [chapterTable.bookId],
		references: [bookTable.id],
	}),
	verses: many(verseTable),
}));

export const insertChapterSchema = createInsertSchema(chapterTable);
export const selectChapterSchema = createSelectSchema(chapterTable);
