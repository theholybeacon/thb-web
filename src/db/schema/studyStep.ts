import { AnyPgColumn, integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { studyTable } from "./study";
import { relations } from "drizzle-orm";

export const studyStepTable = pgTable("study_step", {
	id: uuid().defaultRandom().primaryKey(),
	studyId: uuid().references((): AnyPgColumn => studyTable.id).notNull(),
	stepNumber: integer().notNull(),
	stepType: varchar({ length: 21 }).notNull(),

	title: varchar({ length: 1000 }).notNull(),
	explanation: varchar({ length: 2000 }).notNull(),

	// Universal/canonical Bible references (works across all translations)
	bookAbbreviation: varchar({ length: 10 }),  // e.g., "GEN", "EXO", "MAT"
	startChapter: integer(),
	endChapter: integer(),
	startVerse: integer(),
	endVerse: integer(),

	createdAt: timestamp().defaultNow(),
	updatedAt: timestamp().defaultNow(),
});

export const studyStepRelations = relations(studyStepTable, ({ one }) => ({
	study: one(studyTable, {
		fields: [studyStepTable.studyId],
		references: [studyTable.id],
	}),
}));

export const insertStudyStepSchema = createInsertSchema(studyStepTable);
export const selectStudyStepSchema = createSelectSchema(studyStepTable);
