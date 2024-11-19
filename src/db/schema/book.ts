import { integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import { bibleTable } from "./bible";
import { chapterTable } from "./chapter";

export const bookTable = pgTable("book", {
	id: uuid().primaryKey(),
	bibleId: uuid(),
	name: varchar({ length: 255 }).notNull(),
	bookOrder: integer().notNull(),
	abbreviation: varchar({ length: 10 }).notNull(),
	numChapters: integer().notNull(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
});


export const bookRelations = relations(bookTable, ({ one, many }) => ({
	bible: one(bibleTable, {
		fields: [bookTable.bibleId],
		references: [bibleTable.id],
	}),
	chapters: many(chapterTable),
}));

