import { integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import { bookTable } from "./book";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const bibleTable = pgTable("bible", {
	id: uuid().primaryKey(),
	apiId: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	language: varchar({ length: 50 }).notNull(),
	version: varchar({ length: 50 }).notNull(),
	description: text().notNull(),
	numBooks: integer().notNull().default(0),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),

});

export const bibleRelations = relations(bibleTable, ({ many }) => ({
	books: many(bookTable),
}));


export const insertBibleSchema = createInsertSchema(bibleTable);
export const selectBibleSchema = createSelectSchema(bibleTable);
