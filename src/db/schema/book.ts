import { integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import { bibleTable } from "./bible";
import { chapterTable } from "./chapter";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const bookTable = pgTable("book", {
	id: uuid().defaultRandom().primaryKey(),
	apiId: varchar({ length: 255 }).notNull(),
	bibleId: uuid().notNull(),
	name: varchar({ length: 255 }).notNull(),
	bookOrder: integer().notNull(),
	abbreviation: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 100 }).notNull(),
	numChapters: integer().default(0),
	createdAt: timestamp().defaultNow(),
	updatedAt: timestamp().defaultNow(),
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
