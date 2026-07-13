import { AnyPgColumn, boolean, jsonb, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { entityTable } from "./entity";

export const contentGenerationStatusEnum = pgEnum("content_generation_status", [
	"pending",
	"generating",
	"ready",
	"failed",
]);

/** A canonical scripture reference cited by generated content. */
export type ContentRef = { bookAbbreviation: string; chapter: number; verse: number };
export type TimelineEvent = { title: string; description: string; refs: ContentRef[] };
export type Relationship = { name: string; relation: string; refs: ContentRef[]; entitySlug?: string };

/**
 * AI-generated, cached, shared-to-all content for a character. One row per
 * entity — the row is also the generation lock (see `generationStatus`).
 */
export const entityContentTable = pgTable("entity_content", {
	id: uuid().defaultRandom().primaryKey(),
	entityId: uuid().references((): AnyPgColumn => entityTable.id).notNull().unique(),
	generationStatus: contentGenerationStatusEnum().notNull().default("pending"),
	model: varchar({ length: 60 }),
	overview: text(),
	overviewRefs: jsonb().$type<ContentRef[]>().notNull().default([]),
	significance: text(),
	significanceRefs: jsonb().$type<ContentRef[]>().notNull().default([]),
	timeline: jsonb().$type<TimelineEvent[]>().notNull().default([]),
	relationships: jsonb().$type<Relationship[]>().notNull().default([]),
	citationsValid: boolean().notNull().default(true),
	error: text(),
	generatedAt: timestamp(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
});

export const entityContentRelations = relations(entityContentTable, ({ one }) => ({
	entity: one(entityTable, {
		fields: [entityContentTable.entityId],
		references: [entityTable.id],
	}),
}));

export const insertEntityContentSchema = createInsertSchema(entityContentTable);
export const selectEntityContentSchema = createSelectSchema(entityContentTable);
