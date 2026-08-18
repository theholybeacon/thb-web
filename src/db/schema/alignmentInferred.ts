import { index, integer, pgTable, text, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { contentGenerationStatusEnum } from "./entityContent";

/**
 * A model's best guess at which original-language word a translated word renders.
 *
 * For Spanish, Portuguese and Italian no word-level alignment exists at any
 * price — no edition on api.bible carries Strong's markup, the one tagged
 * Spanish SWORD module is licence-blocked, and nothing exists for pt/it at all.
 * What we DO have for every verse is its verified Greek/Hebrew inventory (from
 * BSB), so the model is never asked to translate: it picks from a closed,
 * known-correct candidate set.
 *
 * Measured against 40 French words holding editorial ground truth:
 *   gpt-4o       95% correct, 100% of the answerable ones
 *   gpt-4o-mini  93% correct,  97% of the answerable ones
 * The ~5% ceiling is a data limit — BSB sometimes renders a different underlying
 * word than the target translation, so the right answer is absent from the
 * candidate set entirely.
 *
 * THIS IS AN INFERENCE, NOT SCHOLARSHIP. It must never be presented with the
 * same authority as the editorial tiers. Self-reported confidence was measured
 * as useless (88% accurate at "high", and confidently wrong on a Portuguese
 * miss), so it is deliberately neither stored nor shown.
 *
 * Cached forever and keyed by translation + position, so a given word in a given
 * verse costs one model call across all users, ever — the economics of
 * entity_content and audio_asset.
 */
export const alignmentInferredTable = pgTable("alignment_inferred", {
	id: uuid().defaultRandom().primaryKey(),

	/** `bible.version` (e.g. RVR09). Different wordings must not share a cache row. */
	bibleVersion: varchar({ length: 20 }).notNull(),

	bookAbbreviation: varchar({ length: 10 }).notNull(),
	chapter: integer().notNull(),
	verse: integer().notNull(),

	/** Normalised selected word + its ordinal in the verse — same key the ladder uses. */
	surfaceNorm: text().notNull(),
	occurrence: integer().notNull(),

	status: contentGenerationStatusEnum().notNull().default("pending"),
	/** The chosen Strong's id, or null when the model declined to choose. */
	strongs: varchar({ length: 8 }),
	/** Which alignment source supplied the candidates, for later invalidation. */
	candidateSource: varchar({ length: 24 }),
	model: varchar({ length: 60 }),
	error: text(),

	inferredAt: timestamp(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
}, (table) => ({
	lookupUnique: unique("alignment_inferred_lookup_unique").on(
		table.bibleVersion, table.bookAbbreviation, table.chapter,
		table.verse, table.surfaceNorm, table.occurrence,
	),
	staleIdx: index("alignment_inferred_status_updated_idx").on(table.status, table.updatedAt),
}));

export const insertAlignmentInferredSchema = createInsertSchema(alignmentInferredTable);
export const selectAlignmentInferredSchema = createSelectSchema(alignmentInferredTable);
