import { AnyPgColumn, boolean, index, integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { studyStepTable } from "./studyStep";
import { relations } from "drizzle-orm";
import { userTable } from "./user";
import { bibleTable } from "./bible";

export const studyTable = pgTable("study", {
	id: uuid().defaultRandom().primaryKey(),

	name: varchar({ length: 255 }).notNull(),
	description: varchar({ length: 1000 }).notNull(),

	depth: integer().notNull().default(1),
	length: integer().notNull().default(1),
	topic: varchar({ length: 1000 }).notNull(),

	/**
	 * NULL only for global studies — the ready-made plans in the catalog belong
	 * to nobody, so there is no user to attribute them to. Every study a reader
	 * can edit, run or delete has an owner, and the ownership checks in
	 * studyGetByIdSS / regenerate-steps still hold because `null !== user.id`.
	 */
	ownerId: uuid().references((): AnyPgColumn => userTable.id),
	bibleId: uuid().references((): AnyPgColumn => bibleTable.id),

	/**
	 * A plan offered to everyone from the catalog (see globalStudyCatalog.ts).
	 * Global studies are templates: they carry no bibleId and are never read
	 * directly by a session — a reader adopts one, which copies it into their
	 * own account in their own translation (studyAdoptSS).
	 */
	isGlobal: boolean().notNull().default(false),
	/**
	 * Stable identity for a global study, so re-running the seed updates the
	 * existing row instead of creating a second copy of the same plan. NULL for
	 * user-created studies.
	 */
	slug: varchar({ length: 100 }).unique(),
	/** Catalog ordering. Ignored for user-created studies. */
	sortOrder: integer().notNull().default(0),
	/**
	 * The global study this one was copied from. Marks a study as an adopted
	 * plan rather than an AI-generated one — the reason the detail page hides
	 * "Regenerate steps" for it, and how the catalog knows to say "Continue".
	 */
	sourceStudyId: uuid().references((): AnyPgColumn => studyTable.id),

	createdAt: timestamp().defaultNow(),
	updatedAt: timestamp().defaultNow(),
}, (table) => ({
	// The catalog listing: a handful of rows out of every study ever created.
	globalIdx: index("study_global_idx").on(table.isGlobal, table.sortOrder),
	// "has this reader already adopted this plan?", asked on every catalog render.
	sourceOwnerIdx: index("study_source_owner_idx").on(table.sourceStudyId, table.ownerId),
}));

export const studyRelations = relations(studyTable, ({ one, many }) => ({
	owner: one(userTable, {
		fields: [studyTable.ownerId],
		references: [userTable.id],
	}),
	bible: one(bibleTable, {
		fields: [studyTable.bibleId],
		references: [bibleTable.id],
	}),
	steps: many(studyStepTable),
}));

export const insertStudySchema = createInsertSchema(studyTable);
export const selectStudySchema = createSelectSchema(studyTable);
