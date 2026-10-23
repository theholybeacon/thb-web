import { AnyPgColumn, integer, pgEnum, pgTable, real, timestamp, uuid } from "drizzle-orm/pg-core";
import { sessionTable } from "./session";
import { studyStepTable } from "./studyStep";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// "done" completes a step that is not Scripture (text, video, reflection...),
// which has no read / type / listen to choose between.
export const studyModeEnum = pgEnum("study_mode", ["read", "type", "listen", "dictation", "done"]);

export const sessionStepCompletionTable = pgTable("session_step_completion", {
	id: uuid().defaultRandom().primaryKey(),
	sessionId: uuid().references((): AnyPgColumn => sessionTable.id, { onDelete: "cascade" }).notNull(),
	stepId: uuid().references((): AnyPgColumn => studyStepTable.id, { onDelete: "cascade" }).notNull(),
	mode: studyModeEnum().notNull(),

	// Stats for type mode
	accuracy: real(),
	wpm: real(),
	timeSpentSeconds: integer(),

	completedAt: timestamp().defaultNow(),
});

export const sessionStepCompletionRelations = relations(sessionStepCompletionTable, ({ one }) => ({
	session: one(sessionTable, {
		fields: [sessionStepCompletionTable.sessionId],
		references: [sessionTable.id],
	}),
	step: one(studyStepTable, {
		fields: [sessionStepCompletionTable.stepId],
		references: [studyStepTable.id],
	}),
}));

export const insertSessionStepCompletionSchema = createInsertSchema(sessionStepCompletionTable);
export const selectSessionStepCompletionSchema = createSelectSchema(sessionStepCompletionTable);
