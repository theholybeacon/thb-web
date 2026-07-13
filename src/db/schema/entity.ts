import { integer, jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { entityMentionTable } from "./entityMention";

/**
 * A biblical character (person). Translation-agnostic — the same entity is
 * referenced from every translation. Seeded from an open dataset and, later,
 * extended by AI-generated content and user contributions.
 */
export const entityTable = pgTable("entity", {
	id: uuid().defaultRandom().primaryKey(),
	// Source dataset id (e.g. theographic person id) — makes the import idempotent.
	datasetId: varchar({ length: 100 }).unique(),
	slug: varchar({ length: 160 }).notNull().unique(),
	name: varchar({ length: 255 }).notNull(),
	// Alternate names/spellings used for inline matching in verse text.
	aliases: jsonb().$type<string[]>().notNull().default([]),
	gender: varchar({ length: 20 }),
	// Approximate years from the dataset (may be negative for BC). Nullable.
	birthYear: integer(),
	deathYear: integer(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
});

export const entityRelations = relations(entityTable, ({ many }) => ({
	mentions: many(entityMentionTable),
}));

export const insertEntitySchema = createInsertSchema(entityTable);
export const selectEntitySchema = createSelectSchema(entityTable);
