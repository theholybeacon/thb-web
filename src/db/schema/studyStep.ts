import { AnyPgColumn, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { studyTable } from "./study";
import { bookTable } from "./book";
import { chapterTable } from "./chapter";
import { verseTable } from "./verse";
import { relations } from "drizzle-orm";
import { bibleTable } from "./bible";

export const studyStepTable = pgTable("study_step", {
	id: uuid().defaultRandom().primaryKey(),
	studyId: uuid().references((): AnyPgColumn => studyTable.id).notNull(),
	stepNumber: integer().notNull(),
	stepType: varchar({ length: 21 }).notNull(),

	title: varchar({ length: 1000 }).notNull(),
	explanation: varchar({ length: 1000 }).notNull(),

	bibleId: uuid().references((): AnyPgColumn => bibleTable.id),

	startBookId: uuid().references((): AnyPgColumn => bookTable.id),
	endBookId: uuid().references((): AnyPgColumn => bookTable.id),

	startChapterId: uuid().references((): AnyPgColumn => chapterTable.id),
	endChapterId: uuid().references((): AnyPgColumn => chapterTable.id),

	startVerseId: uuid().references((): AnyPgColumn => verseTable.id),
	endVerseId: uuid().references((): AnyPgColumn => verseTable.id),

	createdAt: timestamp().defaultNow(),
	updatedAt: timestamp().defaultNow(),
});

export const studyStepRelations = relations(studyStepTable, ({ one }) => ({
	study: one(studyTable, {
		fields: [studyStepTable.studyId],
		references: [studyTable.id],
	}),
	bible: one(bibleTable, {
		fields: [studyStepTable.bibleId],
		references: [bibleTable.id],
	}),
	startBook: one(bookTable, {
		fields: [studyStepTable.startBookId],
		references: [bookTable.id],
	}),
	endBook: one(bookTable, {
		fields: [studyStepTable.endBookId],
		references: [bookTable.id],
	}),

	startChapter: one(chapterTable, {
		fields: [studyStepTable.startChapterId],
		references: [chapterTable.id],
	}),
	endChapter: one(chapterTable, {
		fields: [studyStepTable.endChapterId],
		references: [chapterTable.id],
	}),

	startVerse: one(verseTable, {
		fields: [studyStepTable.startVerseId],
		references: [verseTable.id],
	}),
	endVerse: one(verseTable, {
		fields: [studyStepTable.endVerseId],
		references: [verseTable.id],
	}),
}));

export const insertStudyStepSchema = createInsertSchema(studyStepTable);
export const selectStudyStepSchema = createSelectSchema(studyStepTable);
