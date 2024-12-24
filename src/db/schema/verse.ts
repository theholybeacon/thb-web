import { integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import { chapterTable } from "./chapter";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const verseTable = pgTable("verse", {
	id: uuid().defaultRandom().primaryKey(),
	chapterId: uuid().notNull(),
	verseNumber: integer().notNull(),
	content: varchar({ length: 1000 }).notNull(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
});

export const verseRelations = relations(verseTable, ({ one }) => ({
	chapter: one(chapterTable, {
		fields: [verseTable.chapterId],
		references: [chapterTable.id],
	}),
}));

export const insertVerseSchema = createInsertSchema(verseTable);
export const selectVerseSchema = createSelectSchema(verseTable);
