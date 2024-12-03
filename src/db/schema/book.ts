import { integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import { bibleTable } from "./bible";
import { chapterTable } from "./chapter";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const bookTable = pgTable("book", {
	id: uuid().defaultRandom().primaryKey(),
	bibleId: uuid().notNull(),
	name: varchar({ length: 255 }).notNull(),
	bookOrder: integer().notNull(),
	abbreviation: varchar({ length: 255 }).notNull(),
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

export const insertBookSchema = createInsertSchema(bookTable);
export const selectBookSchema = createSelectSchema(bookTable);
