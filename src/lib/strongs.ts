/**
 * Strong's identifiers and word matching.
 *
 * Every alignment source pads its numbers differently — `G25` / `G0025`,
 * `H430` / `H0430` / `H09002` — and some interleave Hebrew *morphology* codes
 * into the same field. Normalising on the way in and on the way out is what
 * lets rows from BSB, ASV and FreJND share one `strongs_entry` table.
 */

/**
 * The real extent of Strong's, verified against openscriptures/strongs:
 * Greek runs G1–G5624 (5523 entries), Hebrew H1–H8674 (8674 entries).
 *
 * Anything outside those ranges is a *grammar* code that some taggers stuff
 * into the same attribute — Robinson tense-voice-mood codes (G5719 and friends)
 * in DutSVVA/KJV, and the extended prefix codes (H9002) in ChiUns. They have no
 * lexicon entry, so storing them yields rows that can never resolve.
 */
const STRONGS_MAX: Record<"G" | "H", number> = { G: 5624, H: 8674 };

function isLexeme(letter: "G" | "H", numeric: number): boolean {
	return numeric >= 1 && numeric <= STRONGS_MAX[letter];
}

/**
 * Canonical form: an uppercase `G`/`H` followed by four digits (`G0025`).
 * Returns null for morphology codes and anything unparseable.
 */
export function normalizeStrongs(raw: string | null | undefined): string | null {
	if (!raw) return null;

	// Accept "strong:G0025", "Strong:G3767", "G25", "H09002".
	const match = /([GgHh])0*(\d{1,5})/.exec(raw.trim());
	if (!match) return null;

	const letter = match[1].toUpperCase() as "G" | "H";
	const numeric = Number.parseInt(match[2], 10);
	if (!Number.isFinite(numeric) || !isLexeme(letter, numeric)) return null;

	return `${letter}${String(numeric).padStart(4, "0")}`;
}

/** Every valid Strong's id in a raw attribute, deduped and in order. */
export function extractStrongs(raw: string | null | undefined): string[] {
	if (!raw) return [];
	const out: string[] = [];
	for (const token of raw.match(/[GgHh]\d{1,5}/g) ?? []) {
		const id = normalizeStrongs(token);
		if (id && !out.includes(id)) out.push(id);
	}
	return out;
}

export function strongsLanguage(strongs: string): "greek" | "hebrew" {
	return strongs.startsWith("G") ? "greek" : "hebrew";
}

/**
 * The matching key for a rendered word: lowercased, accent-stripped and free of
 * surrounding punctuation, so a reader's selection of "Amado," in the DOM finds
 * the row stored as "amado".
 *
 * Apostrophes are kept — dropping them would merge distinct English forms
 * ("brother's" / "brothers") — but curly ones are folded to straight so the
 * typographic apostrophes common in Bible text still match.
 */
export function normalizeSurface(text: string): string {
	return text
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[‘’]/g, "'")
		.toLowerCase()
		.replace(/[^\p{L}\p{N}'\s-]/gu, "")
		.replace(/\s+/g, " ")
		.trim();
}

/** The dictionary cache key: same folding, but accents are meaning-bearing. */
export function normalizeWord(text: string): string {
	return text
		.replace(/[‘’]/g, "'")
		.toLowerCase()
		.replace(/[^\p{L}\p{N}'\s-]/gu, "")
		.replace(/\s+/g, " ")
		.trim();
}
