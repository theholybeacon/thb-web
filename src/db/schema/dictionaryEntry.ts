import { index, jsonb, pgTable, text, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { contentGenerationStatusEnum } from "./entityContent";

/** One pronunciation as Wiktionary records it (usually IPA, tagged by accent). */
export type DictionaryPronunciation = { type: string; text: string; tags: string[] };

/** An inflected or alternative form of the headword ("loves", plural). */
export type DictionaryForm = { word: string; tags: string[] };

export type DictionarySense = {
	definition: string;
	tags: string[];
	examples: string[];
	synonyms: string[];
	antonyms: string[];
};

/** One part-of-speech block. A word usually has several (love: noun + verb). */
export type DictionaryPosEntry = {
	partOfSpeech: string;
	pronunciations: DictionaryPronunciation[];
	forms: DictionaryForm[];
	senses: DictionarySense[];
};

/**
 * The cached shape we render. Deliberately not the upstream response verbatim:
 * normalising at write time means the panel never has to know which provider a
 * row came from, and a provider change does not invalidate the cache format.
 */
export type DictionaryPayload = {
	word: string;
	entries: DictionaryPosEntry[];
	/** Link back to the Wiktionary page — required by CC BY-SA attribution. */
	sourceUrl: string | null;
	license: { name: string; url: string } | null;
};

/**
 * A cached dictionary lookup, shared by every reader.
 *
 * The row is also the fetch lock (`status`), reusing the conditional-UPDATE
 * pattern from entity_content and audio_asset: concurrent readers highlighting
 * the same word cause one outbound request, not N. That matters here because
 * the upstream API rate-limits per IP, and on Vercel every user shares ours.
 *
 * A word that genuinely does not exist is cached too, as `ready` with zero
 * entries — otherwise every stray selection re-hits the API forever.
 */
export const dictionaryEntryTable = pgTable("dictionary_entry", {
	id: uuid().defaultRandom().primaryKey(),

	/** ISO 639-1 code, resolved from the free-form `bible.language` name. */
	lang: varchar({ length: 8 }).notNull(),
	/** Lowercased, whitespace-collapsed lookup key. */
	word: varchar({ length: 128 }).notNull(),

	status: contentGenerationStatusEnum().notNull().default("pending"),
	payload: jsonb().$type<DictionaryPayload | null>(),
	source: varchar({ length: 32 }).notNull().default("freedictionaryapi"),
	error: text(),

	fetchedAt: timestamp(),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
}, (table) => ({
	langWordUnique: unique("dictionary_entry_lang_word_unique").on(table.lang, table.word),
	staleIdx: index("dictionary_entry_status_updated_idx").on(table.status, table.updatedAt),
}));

export const insertDictionaryEntrySchema = createInsertSchema(dictionaryEntryTable);
export const selectDictionaryEntrySchema = createSelectSchema(dictionaryEntryTable);
