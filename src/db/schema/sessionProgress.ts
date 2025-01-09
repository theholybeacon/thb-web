import { AnyPgColumn, boolean, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { bookTable } from "./book";
import { chapterTable } from "./chapter";
import { sessionTable } from "./session";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const sessionProgressTable = pgTable("user_study_progress", {
	id: uuid().defaultRandom().primaryKey(),
	sessionId: uuid().references((): AnyPgColumn => sessionTable.id).notNull(),
	bookId: uuid().references((): AnyPgColumn => bookTable.id).notNull(),
	chapterId: uuid().references((): AnyPgColumn => chapterTable.id).notNull(),
	completed: boolean().default(false),
	completedAt: timestamp(),
});

export const insertSessionProgressSchema = createInsertSchema(sessionProgressTable);
export const selectSessionProgressSchema = createSelectSchema(sessionProgressTable);
