import { AnyPgColumn, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { userTable } from "./user";
import { studyTable } from "./study";
import { studyStepTable } from "./studyStep";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const sessionTable = pgTable("session", {
	id: uuid().defaultRandom().primaryKey(),
	userId: uuid().references((): AnyPgColumn => userTable.id).notNull(),
	studyId: uuid().references((): AnyPgColumn => studyTable.id).notNull(),

	currentStepId: uuid().references((): AnyPgColumn => studyStepTable.id).notNull(),

	// Progress tracking using canonical references (works across translations)
	currentBookAbbreviation: varchar({ length: 10 }),
	currentChapter: integer(),
	currentVerse: integer(),

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
}));

export const insertSessionSchema = createInsertSchema(sessionTable);
export const selectSessionSchema = createSelectSchema(sessionTable);
