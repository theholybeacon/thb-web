import { integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";
import { chapterTable } from "./chapter";

export const verseTable = pgTable("verse", {
	id: uuid().primaryKey(),
	chapterId: uuid(),
	verseNumber: integer().notNull(),
	content: varchar({ length: 255 }).notNull(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
});

export const verseRelations = relations(verseTable, ({ one }) => ({
	chapter: one(chapterTable, {
		fields: [verseTable.chapterId],
		references: [chapterTable.id],
	}),
}));

