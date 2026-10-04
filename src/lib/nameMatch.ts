/**
 * Whole-word name matching that works outside ASCII.
 *
 * JavaScript's `\b` only knows [A-Za-z0-9_], so `\bMoïse\b` fails on the "ï" and
 * `\bÉsaïe\b` never matches at all. Letters, combining marks and digits from
 * any script count as word characters here instead. Everything is NFC-normalised
 * because api.bible text and dataset names do not agree on composed vs.
 * decomposed accents.
 *
 * Shared by the reader (VerseText) and by the scripts that decide which
 * localized names to store, so "the script validated it" and "the reader links
 * it" can never disagree.
 */

const WORD_CHAR = "[\\p{L}\\p{M}\\p{N}]";

function escapeRegExp(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function normalizeName(s: string): string {
	return s.normalize("NFC").trim();
}

/** A global, case-insensitive regex matching any of `terms` as a whole word. Longest first. */
export function buildNamePattern(terms: string[]): RegExp | null {
	const unique = Array.from(new Set(terms.map(normalizeName).filter(Boolean)));
	if (unique.length === 0) return null;
	unique.sort((a, b) => b.length - a.length);
	return new RegExp(`(?<!${WORD_CHAR})(${unique.map(escapeRegExp).join("|")})(?!${WORD_CHAR})`, "giu");
}

/** True when `term` occurs in `text` as a whole word, ignoring case. */
export function containsName(text: string, term: string): boolean {
	const pattern = buildNamePattern([term]);
	return pattern ? pattern.test(text.normalize("NFC")) : false;
}
