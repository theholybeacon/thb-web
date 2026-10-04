import { AnyPgColumn, index, pgEnum, pgTable, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { entityTable } from "./entity";

export const entityAliasSourceEnum = pgEnum("entity_alias_source", ["alignment", "ai"]);

/**
 * How a person is named in one language — "Moïse", "Mose", "Moisés" for Moses.
 *
 * `entity.aliases` comes from an English-only dataset, so inline linking by name
 * silently fails in every other translation. These rows fill that gap per ISO
 * 639-1 language. Every term is validated against the recommended translation's
 * own verse text before it is stored (scripts/localize-bible-people.ts), so a
 * row here is a spelling that actually occurs in scripture, not a guess.
 *
 * `source` records provenance: `alignment` terms were read off an editorial
 * Strong's alignment (exact); `ai` terms were proposed by a model and survived
 * the verse-text check.
 */
export const entityAliasTable = pgTable("entity_alias", {
	id: uuid().defaultRandom().primaryKey(),
	entityId: uuid().references((): AnyPgColumn => entityTable.id, { onDelete: "cascade" }).notNull(),
	lang: varchar({ length: 8 }).notNull(),
	term: varchar({ length: 255 }).notNull(),
	source: entityAliasSourceEnum().notNull(),
	createdAt: timestamp().notNull().defaultNow(),
}, (t) => ({
	uniqueTerm: unique("entity_alias_entity_lang_term_unique").on(t.entityId, t.lang, t.term),
	entityLangIdx: index("entity_alias_entity_lang_idx").on(t.entityId, t.lang),
}));

export const entityAliasRelations = relations(entityAliasTable, ({ one }) => ({
	entity: one(entityTable, {
		fields: [entityAliasTable.entityId],
		references: [entityTable.id],
	}),
}));

export const insertEntityAliasSchema = createInsertSchema(entityAliasTable);
export const selectEntityAliasSchema = createSelectSchema(entityAliasTable);
