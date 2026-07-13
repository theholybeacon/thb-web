import { AnyPgColumn, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { entityTable } from "./entity";
import { userTable } from "./user";
import type { ContentRef } from "./entityContent";

export const contributionSectionEnum = pgEnum("contribution_section", [
	"overview",
	"timeline",
	"relationships",
	"significance",
	"general",
]);
export const contributionKindEnum = pgEnum("contribution_kind", ["fact", "analysis", "correction"]);
export const contributionStatusEnum = pgEnum("contribution_status", ["published", "removed"]);

/** A user-submitted note attached to a specific AI section of a character. */
export const contributionTable = pgTable("contribution", {
	id: uuid().defaultRandom().primaryKey(),
	entityId: uuid().references((): AnyPgColumn => entityTable.id).notNull(),
	section: contributionSectionEnum().notNull(),
	userId: uuid().references((): AnyPgColumn => userTable.id).notNull(),
	kind: contributionKindEnum().notNull(),
	body: text().notNull(),
	citations: jsonb().$type<ContentRef[]>().notNull().default([]),
	score: integer().notNull().default(0),
	status: contributionStatusEnum().notNull().default("published"),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
}, (t) => ({
	entitySectionIdx: index("contribution_entity_section_idx").on(t.entityId, t.section),
}));

export const contributionRelations = relations(contributionTable, ({ one }) => ({
	entity: one(entityTable, { fields: [contributionTable.entityId], references: [entityTable.id] }),
	author: one(userTable, { fields: [contributionTable.userId], references: [userTable.id] }),
}));

export const insertContributionSchema = createInsertSchema(contributionTable);
export const selectContributionSchema = createSelectSchema(contributionTable);
