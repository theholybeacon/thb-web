import { dictionaryEntryTable } from "@/db/schema/dictionaryEntry";

export type DictionaryEntry = typeof dictionaryEntryTable.$inferSelect;
export type DictionaryEntryInsert = typeof dictionaryEntryTable.$inferInsert;

export type {
	DictionaryPayload,
	DictionaryPosEntry,
	DictionarySense,
	DictionaryForm,
	DictionaryPronunciation,
} from "@/db/schema/dictionaryEntry";

/** One cached lookup: a word in `lang`, defined in `definitionLang`. */
export interface DictionaryKey {
	lang: string;
	definitionLang: string;
	word: string;
}

/** What the reader panel receives. `notFound` is a real, cached answer. */
export interface DictionaryLookupResult {
	word: string;
	lang: string;
	definitionLang: string;
	status: "ready" | "pending" | "notFound" | "unavailable";
	payload: import("@/db/schema/dictionaryEntry").DictionaryPayload | null;
}
