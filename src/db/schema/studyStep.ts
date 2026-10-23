import { AnyPgColumn, integer, jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { studyTable } from "./study";
import { relations } from "drizzle-orm";
import type { StepContent } from "@/app/common/studyStep/model/StepContent";

export const studyStepTable = pgTable("study_step", {
	id: uuid().defaultRandom().primaryKey(),
	studyId: uuid().references((): AnyPgColumn => studyTable.id).notNull(),
	stepNumber: integer().notNull(),
	/**
	 * What the step is: a passage of Scripture, or something read alongside it
	 * (text, a reflection question, a character, an image, a video, a link).
	 * See StepKind. Every step written before kinds existed is "scripture".
	 */
	kind: varchar({ length: 20 }).notNull().default("scripture"),
	/** How much of a book a scripture step covers (StudyStepType). NULL for the other kinds. */
	stepType: varchar({ length: 21 }),
	/**
	 * The step's own material for every kind but scripture, validated by
	 * stepContentSchema. NULL for scripture steps, whose content is the passage.
	 */
	content: jsonb().$type<StepContent>(),

	title: varchar({ length: 1000 }).notNull(),
	explanation: varchar({ length: 2000 }).notNull(),

	// Universal/canonical Bible references (works across all translations).
	// A scripture step's passage; a reflection step's optional anchor, where the
	// reader's answer is saved as a note.
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
