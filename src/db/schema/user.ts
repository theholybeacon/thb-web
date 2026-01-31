import { AnyPgColumn, pgTable, uuid, varchar, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { studyTable } from './study';
import { relations } from 'drizzle-orm';
import { bibleTable } from './bible';

export const userTable = pgTable("user", {
	id: uuid().defaultRandom().primaryKey(),
	name: varchar({ length: 255 }).notNull(),
	username: varchar({ length: 255 }).notNull().unique(),
	email: varchar({ length: 255 }).notNull().unique(),
	authId: varchar({ length: 255 }).notNull().unique(),
	isEmailVerified: boolean().notNull().default(false),
	defaultBibleId: uuid().references((): AnyPgColumn => bibleTable.id),
});

export const userRelations = relations(userTable, ({ one, many }) => ({
	studies: many(studyTable),
	defaultBible: one(bibleTable, {
		fields: [userTable.defaultBibleId],
		references: [bibleTable.id],
	}),
}));

export const insertUserSchema = createInsertSchema(userTable);
export const selectUserSchema = createSelectSchema(userTable);
