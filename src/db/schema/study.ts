import { AnyPgColumn, integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { studyStepTable } from "./studyStep";
import { relations } from "drizzle-orm";
import { userTable } from "./user";

export const studyTable = pgTable("study", {
	id: uuid().defaultRandom().primaryKey(),

	name: varchar({ length: 100 }).notNull(),
	description: varchar({ length: 200 }).notNull(),

	depth: integer().notNull().default(1),
	length: integer().notNull().default(1),
	topic: varchar({ length: 200 }).notNull(),

	ownerId: uuid().references((): AnyPgColumn => userTable.id).notNull(),


	createdAt: timestamp().defaultNow(),
	updatedAt: timestamp().defaultNow(),
});

export const studyRelations = relations(studyTable, ({ one, many }) => ({
	owner: one(userTable, {
		fields: [studyTable.ownerId],
		references: [userTable.id],
	}),
	steps: many(studyStepTable),
}));

export const insertStudySchema = createInsertSchema(studyTable);
export const selectStudySchema = createSelectSchema(studyTable);
