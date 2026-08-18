import { AnyPgColumn, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations, sql } from "drizzle-orm";
import { entityTable } from "./entity";
import { userTable } from "./user";
import { bibleTable } from "./bible";
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

/**
 * A user-submitted post, anchored either to one AI section of a character or to
 * a point in scripture. Exactly one of the two anchors is set — enforced by the
 * `contribution_anchor_check` CHECK constraint, which lives in SQL only.
 *
 * The scripture anchor is a canonical reference (bookAbbreviation + chapter +
 * verse) rather than an FK to a verse row, the same convention as `note` and
 * entity_mention. That is what lets a thread started on John 3:16 in the KJV
 * surface when the passage is later read in any other translation. `bibleId` is
 * the translation it was written in: a soft pointer for linking back, and the
 * actual target for bible-scope threads.
 *
 * Replies, votes and flags address a contribution by id, so they are blind to
 * which anchor it uses.
 */
export const contributionTable = pgTable("contribution", {
	id: uuid().defaultRandom().primaryKey(),

	// Entity anchor. Null for scripture threads.
	entityId: uuid().references((): AnyPgColumn => entityTable.id),
	section: contributionSectionEnum(),

	// Scripture anchor. All null for entity threads.
	targetType: varchar({ length: 10 }), // bible | book | chapter | verse
	bibleId: uuid().references((): AnyPgColumn => bibleTable.id),
	/** Uppercased USFM abbreviation (book.apiId), null above its scope. */
	bookAbbreviation: varchar({ length: 10 }),
	chapter: integer(),
	verse: integer(),

	// Denormalized at write time for display and back-links, as on `note`.
	reference: varchar({ length: 255 }),
	bookName: varchar({ length: 255 }),
	bibleSlug: varchar({ length: 100 }),
	bookSlug: varchar({ length: 100 }),

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
	// The reader's hot path. Partial on scripture rows so it stays small; btree
	// indexes NULLs, so it also serves the book-scope lookup (chapter IS NULL).
	scriptureChapterIdx: index("contribution_scripture_chapter_idx")
		.on(t.bookAbbreviation, t.chapter)
		.where(sql`${t.entityId} is null`),
	scriptureBibleIdx: index("contribution_scripture_bible_idx")
		.on(t.bibleId)
		.where(sql`${t.entityId} is null`),
}));

export const contributionRelations = relations(contributionTable, ({ one }) => ({
	entity: one(entityTable, { fields: [contributionTable.entityId], references: [entityTable.id] }),
	bible: one(bibleTable, { fields: [contributionTable.bibleId], references: [bibleTable.id] }),
	author: one(userTable, { fields: [contributionTable.userId], references: [userTable.id] }),
}));

export const insertContributionSchema = createInsertSchema(contributionTable);
export const selectContributionSchema = createSelectSchema(contributionTable);
