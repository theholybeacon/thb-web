import { alignmentWordTable, strongsEntryTable } from "@/db/schema/alignment";
import { alignmentBookTable } from "@/db/schema/alignmentBook";
import { alignmentInferredTable } from "@/db/schema/alignmentInferred";

export type AlignmentWord = typeof alignmentWordTable.$inferSelect;
export type AlignmentWordInsert = typeof alignmentWordTable.$inferInsert;
export type StrongsEntry = typeof strongsEntryTable.$inferSelect;
export type StrongsEntryInsert = typeof strongsEntryTable.$inferInsert;
export type AlignmentBook = typeof alignmentBookTable.$inferSelect;
export type AlignmentInferred = typeof alignmentInferredTable.$inferSelect;

/**
 * How confident the match is — rendered in the panel so the UI never implies
 * more precision than it has.
 *
 * exact  — the reader's own translation is aligned; this word maps to this word.
 * sibling— a different translation in the same language matched by surface form.
 * verse  — no word-level match; these are the original-language words of the
 *          verse as a whole.
 * inferred— a model's pick from that verse's verified Greek/Hebrew, for the
 *          languages where no editorial alignment exists (es/pt/it). ~95%
 *          accurate and NOT scholarship; must be labelled distinctly wherever
 *          shown, never presented like the editorial tiers.
 */
export type AlignmentTier = "exact" | "sibling" | "verse" | "inferred";

/** One original-language word, joined to its lexicon entry. */
export interface AlignedOriginal {
	strongs: string;
	/** The original-language headword, e.g. ἀγαπάω. */
	lemma: string | null;
	translit: string | null;
	definition: string | null;
	shortDefinition: string | null;
	language: "greek" | "hebrew";
	/** The word as rendered in the aligned translation, e.g. "love". */
	surface: string | null;
	morph: string | null;
}

export interface AlignmentLookupResult {
	tier: AlignmentTier | null;
	/**
	 * `loading` means the book is being fetched from Blob right now — distinct
	 * from a null tier, which means we looked and there is genuinely nothing.
	 * The panel polls on this.
	 */
	status: "ready" | "loading" | "unavailable";
	/** Populated for exact/sibling: the original word(s) behind the selection. */
	matched: AlignedOriginal[];
	/** Populated for every tier: the whole verse, in original-language order. */
	verseWords: AlignedOriginal[];
	sourceCode: string | null;
	sourceLabel: string | null;
	attribution: string | null;
}
