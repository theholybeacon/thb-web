import { AnyPgColumn, index, integer, pgTable, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { entityTable } from "./entity";

/**
 * A deterministic link between an entity and a verse it is mentioned in.
 * Stored as a canonical reference (bookAbbreviation + chapter + verse) so it
 * works across every translation — resolve to a concrete verse row per bibleId
 * at read-time (see chapterGetByCanonicalRefSS / bookGetByAbbreviationAndBibleIdSS).
 */
export const entityMentionTable = pgTable("entity_mention", {
	id: uuid().defaultRandom().primaryKey(),
	entityId: uuid().references((): AnyPgColumn => entityTable.id).notNull(),
	bookAbbreviation: varchar({ length: 10 }).notNull(), // canonical, e.g. "GEN", "MAT"
	chapter: integer().notNull(),
	verse: integer().notNull(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
}, (t) => ({
	uniqueMention: unique().on(t.entityId, t.bookAbbreviation, t.chapter, t.verse),
	// Fast "who is mentioned in this chapter" lookup for reader linking.
	bookChapterIdx: index("entity_mention_book_chapter_idx").on(t.bookAbbreviation, t.chapter),
	// Fast "all references for this entity" lookup for the character page.
	entityIdIdx: index("entity_mention_entityId_idx").on(t.entityId),
}));

export const entityMentionRelations = relations(entityMentionTable, ({ one }) => ({
	entity: one(entityTable, {
		fields: [entityMentionTable.entityId],
		references: [entityTable.id],
	}),
}));

export const insertEntityMentionSchema = createInsertSchema(entityMentionTable);
export const selectEntityMentionSchema = createSelectSchema(entityMentionTable);
