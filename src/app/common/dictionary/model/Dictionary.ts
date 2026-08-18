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

/** What the reader panel receives. `notFound` is a real, cached answer. */
export interface DictionaryLookupResult {
	word: string;
	lang: string;
	status: "ready" | "pending" | "notFound" | "unavailable";
	payload: import("@/db/schema/dictionaryEntry").DictionaryPayload | null;
}
