import { AnyPgColumn, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { userTable } from "./user";
import { studyTable } from "./study";
import { studyStepTable } from "./studyStep";
import { bookTable } from "./book";
import { chapterTable } from "./chapter";
import { verseTable } from "./verse";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const sessionTable = pgTable("session", {
	id: uuid().defaultRandom().primaryKey(),
	userId: uuid().references((): AnyPgColumn => userTable.id).notNull(),
	studyId: uuid().references((): AnyPgColumn => studyTable.id).notNull(),

	currentStepId: uuid().references((): AnyPgColumn => studyStepTable.id).notNull(),

	currentBookId: uuid().references((): AnyPgColumn => bookTable.id),
	currentChapterId: uuid().references((): AnyPgColumn => chapterTable.id),
	currentVerseId: uuid().references((): AnyPgColumn => verseTable.id),

	progressDetail: text(),

	startedAt: timestamp().defaultNow(),
	updatedAt: timestamp().defaultNow(),
});


export const sessionRelations = relations(sessionTable, ({ one }) => ({
	user: one(userTable, {
		fields: [sessionTable.userId],
		references: [userTable.id],
	}),
	study: one(studyTable, {
		fields: [sessionTable.studyId],
		references: [studyTable.id],
	}),
	currentStep: one(studyStepTable, {
		fields: [sessionTable.currentStepId],
		references: [studyStepTable.id],
	}),
	currentBook: one(bookTable, {
		fields: [sessionTable.currentBookId],
		references: [bookTable.id],
	}),
	currentChapter: one(chapterTable, {
		fields: [sessionTable.currentChapterId],
		references: [chapterTable.id],
	}),
	currentVerse: one(verseTable, {
		fields: [sessionTable.currentBookId],
		references: [verseTable.id],
	}),
}));

export const insertSessionSchema = createInsertSchema(sessionTable);
export const selectSessionSchema = createSelectSchema(sessionTable);
