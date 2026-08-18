import { bigserial, index, integer, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const strongsLanguageEnum = pgEnum("strongs_language", ["greek", "hebrew"]);

/**
 * One Strong's lexicon entry — what G0025 actually means.
 *
 * Keyed on the *normalised* id (letter + 4 digits, e.g. `G0025`, `H0430`).
 * Sources pad inconsistently — G25/G0025, H430/H0430/H09002 — so every writer
 * and every reader must go through `normalizeStrongs`.
 */
export const strongsEntryTable = pgTable("strongs_entry", {
	strongs: varchar({ length: 8 }).primaryKey(),
	language: strongsLanguageEnum().notNull(),

	/** The original-language headword, e.g. ἀγαπάω. */
	lemma: text(),
	/** Latin transliteration, e.g. "agapaō". */
	translit: text(),
	pronunciation: text(),
	definition: text(),
	/** Strong's own gloss, kept separate from the fuller lexicon definition. */
	shortDefinition: text(),
	derivation: text(),

	source: varchar({ length: 32 }).notNull(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
});

/**
 * One aligned word of one translation: the bridge between a word the reader can
 * actually see on screen and the original-language word behind it.
 *
 * Anchored canonically (bookAbbreviation + chapter + verse) rather than by a FK
 * to `verse`, matching entity_mention / note / session / study_step — so a
 * lookup resolves regardless of which translation row the reader is on.
 *
 * `occurrence` is the 1-based ordinal of `surfaceNorm` within its verse, which
 * is how a DOM text selection is matched back to a row ("the 2nd `love` in
 * v17"). It mirrors USFM3's own `x-occurrence` model and avoids counting word
 * indices across the reader's multi-span verse parts.
 *
 * `strongs` is an array because sources routinely map one rendered word to
 * several original words ("they had finished eating" -> G0709).
 */
export const alignmentWordTable = pgTable("alignment_word", {
	/*
	 * bigserial, not uuid: this table is append-only seed data, nothing holds a
	 * foreign key to it, and at ~1.5M rows across sources a random 16-byte key
	 * costs about 8 MB of index per source for no benefit.
	 */
	id: bigserial({ mode: "number" }).primaryKey(),

	/** Registry code of the source translation, e.g. `bsb`, `asv`, `frejnd`. */
	sourceCode: varchar({ length: 24 }).notNull(),

	bookAbbreviation: varchar({ length: 10 }).notNull(),
	chapter: integer().notNull(),
	verse: integer().notNull(),

	/** Position of this word within the verse, 0-based, in reading order. */
	wordIndex: integer().notNull(),
	/** 1-based ordinal of `surfaceNorm` within the verse. */
	occurrence: integer().notNull(),

	/** The rendered text as the reader sees it, e.g. "amas". */
	surface: text().notNull(),
	/** Lowercased and unaccented, for matching against a selection. */
	surfaceNorm: text().notNull(),

	strongs: varchar({ length: 8 }).array().notNull().default([]),
	lemma: text(),
	morph: text(),

	createdAt: timestamp().notNull().defaultNow(),
}, (table) => ({
	// The hot path: "everything aligned for this verse in this source".
	verseIdx: index("alignment_word_verse_idx").on(
		table.sourceCode, table.bookAbbreviation, table.chapter, table.verse,
	),
	/*
	 * Deliberately NO index on surfaceNorm. Every surface query is also scoped to
	 * source+book+chapter+verse, which `verseIdx` already narrows to the dozen or
	 * so words of a single verse — filtering those in the heap is free, whereas
	 * the index cost 25 MB per source, a quarter of the table's whole footprint.
	 */
}));

export const insertStrongsEntrySchema = createInsertSchema(strongsEntryTable);
export const selectStrongsEntrySchema = createSelectSchema(strongsEntryTable);
export const insertAlignmentWordSchema = createInsertSchema(alignmentWordTable);
export const selectAlignmentWordSchema = createSelectSchema(alignmentWordTable);
