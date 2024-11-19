import { integer, pgTable, timestamp, uuid, } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import { bookTable } from "./book";
import { verseTable } from "./verse";

export const chapterTable = pgTable("chapter", {
	id: uuid().primaryKey(),
	bookId: uuid(),
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
