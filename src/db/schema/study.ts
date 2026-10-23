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
	 * What the study is: a reading plan or one of the Bible's stories (Noah's
	 * Ark, David and Goliath). Both run on the same engine; the kind only
	 * changes how the study is labelled and filtered. See StudyKind.
	 */
	kind: varchar({ length: 10 }).notNull().default("plan"),
	/**
	 * The one language the study is written in (ISO 639-1: "en", "es"). Titles,
	 * explanations and text steps are in this language, so it is read with a
	 * Bible in the same language. Another language is another study.
	 */
	language: varchar({ length: 5 }).notNull().default("en"),
	/**
	 * Who designed the study — not who is running it. `ownerId` is whose copy
	 * this is; adopting a plan makes the reader the owner of their copy, but the
	 * creator stays whoever designed it. NULL means The Holy Beacon: the global
	 * catalog and every copy taken from it.
	 */
	creatorId: uuid().references((): AnyPgColumn => userTable.id, { onDelete: "set null" }),

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
	creatorIdx: index("study_creator_idx").on(table.creatorId),
	// "has this reader already adopted this plan?", asked on every catalog render.
	sourceOwnerIdx: index("study_source_owner_idx").on(table.sourceStudyId, table.ownerId),
}));

export const studyRelations = relations(studyTable, ({ one, many }) => ({
	owner: one(userTable, {
		fields: [studyTable.ownerId],
		references: [userTable.id],
		relationName: "studyOwner",
	}),
	creator: one(userTable, {
		fields: [studyTable.creatorId],
		references: [userTable.id],
		relationName: "studyCreator",
	}),
	bible: one(bibleTable, {
		fields: [studyTable.bibleId],
		references: [bibleTable.id],
	}),
	steps: many(studyStepTable),
}));

export const insertStudySchema = createInsertSchema(studyTable);
export const selectStudySchema = createSelectSchema(studyTable);
