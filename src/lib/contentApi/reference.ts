import { CANON, CanonBook, canonBook } from "@/app/common/canon/model/canon";

/**
 * Parses the URL-safe scripture references the Content API accepts.
 *
 * The rest of the app addresses scripture as a canonical triple
 * (bookAbbreviation + chapter + verse) and never as a single string — there is
 * no reference parser anywhere else in the repo to reuse, so this is the one
 * place a string becomes a triple. It deliberately produces the SAME vocabulary
 * everything else already speaks: uppercase USFM codes from `CANON`.
 *
 * Accepted shapes (case-insensitive, `.` and `_` normalise to `-`):
 *
 *   psa-117            whole chapter
 *   john-3-16          single verse
 *   john-3-16-18       verse range
 *   JHN.3.16           USFM code with dot separators
 *   1co-13-4-7         numbered book, verse range
 *   song-of-solomon-1  multi-word book name
 *
 * Deuterocanonical books are rejected: `CANON` is the 66-book Protestant canon,
 * which is also the denominator every other feature measures against.
 */

/** Ranges are capped so this stays a "short range" API and not a bulk export. */
export const MAX_RANGE_VERSES = 25;

export type ParsedReference = {
	/** Uppercase USFM code, e.g. "JHN". Matches `book.abbreviation`. */
	usfm: string;
	book: CanonBook;
	chapter: number;
	/** Null for a whole-chapter reference. */
	startVerse: number | null;
	/** Equals startVerse for a single verse; null for a whole chapter. */
	endVerse: number | null;
};

export class ReferenceParseError extends Error {
	constructor(readonly code: ReferenceErrorCode, message: string) {
		super(message);
		this.name = "ReferenceParseError";
	}
}

export type ReferenceErrorCode =
	| "INVALID_REFERENCE"
	| "UNKNOWN_BOOK"
	| "CHAPTER_OUT_OF_RANGE"
	| "INVALID_VERSE_RANGE"
	| "RANGE_TOO_LARGE";

function slugify(input: string): string {
	return input
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

/**
 * Extra spellings people (and language models) actually write. Kept small and
 * explicit rather than fuzzy-matched: a near-miss that silently resolves to the
 * wrong book would put the wrong words on screen, which is the one failure this
 * whole API exists to prevent.
 */
const ALIASES: Record<string, string> = {
	psalm: "PSA",
	psalms: "PSA",
	song: "SNG",
	"song-of-songs": "SNG",
	canticles: "SNG",
	ecclesiast: "ECC",
	revelations: "REV",
	apocalypse: "REV",
	// Common short forms that are not the USFM code.
	gen: "GEN", exod: "EXO", lev: "LEV", num: "NUM", deut: "DEU",
	josh: "JOS", judg: "JDG", ruth: "RUT",
	"1sam": "1SA", "2sam": "2SA", "1kings": "1KI", "2kings": "2KI",
	"1chron": "1CH", "2chron": "2CH", "1chronicles": "1CH", "2chronicles": "2CH",
	ezra: "EZR", neh: "NEH", esth: "EST", prov: "PRO",
	isa: "ISA", jer: "JER", lam: "LAM", ezek: "EZK", dan: "DAN",
	hos: "HOS", joel: "JOL", amos: "AMO", obad: "OBA", jonah: "JON",
	mic: "MIC", nah: "NAM", nahum: "NAM", hab: "HAB", zeph: "ZEP",
	hag: "HAG", zech: "ZEC", mal: "MAL",
	matt: "MAT", mark: "MRK", luke: "LUK", john: "JHN", acts: "ACT",
	rom: "ROM", "1cor": "1CO", "2cor": "2CO", gal: "GAL", eph: "EPH",
	phil: "PHP", philippians: "PHP", col: "COL",
	"1thess": "1TH", "2thess": "2TH", "1tim": "1TI", "2tim": "2TI",
	titus: "TIT", philem: "PHM", heb: "HEB", james: "JAS",
	"1pet": "1PE", "2pet": "2PE", "1john": "1JN", "2john": "2JN", "3john": "3JN",
	jude: "JUD", rev: "REV",
};

/** book-name key -> USFM. Built once: USFM codes, English names, then aliases. */
const BOOK_KEYS: Map<string, string> = (() => {
	const map = new Map<string, string>();
	for (const b of CANON) {
		map.set(b.usfm.toLowerCase(), b.usfm);
		map.set(slugify(b.englishName), b.usfm);
		// "1 Samuel" -> "1samuel" as well as "1-samuel".
		map.set(slugify(b.englishName).replace(/-/g, ""), b.usfm);
	}
	// Aliases last so they can fill gaps but never shadow a real name.
	for (const [key, usfm] of Object.entries(ALIASES)) {
		if (!map.has(key)) map.set(key, usfm);
	}
	return map;
})();

/** Every accepted spelling, for docs and error messages. */
export function knownBookKeys(): string[] {
	return [...BOOK_KEYS.keys()].sort();
}

export function parseReference(raw: string): ParsedReference {
	const normalized = slugify(decodeURIComponent(raw ?? ""));
	if (!normalized) {
		throw new ReferenceParseError("INVALID_REFERENCE", "Reference is empty.");
	}

	const parts = normalized.split("-");

	// Greedily take the LONGEST leading run of tokens that names a book, so
	// "song-of-solomon-1-1" beats a shorter accidental match.
	let usfm: string | undefined;
	let consumed = 0;
	for (let take = Math.min(parts.length, 4); take >= 1; take--) {
		const candidate = parts.slice(0, take).join("-");
		const hit = BOOK_KEYS.get(candidate) ?? BOOK_KEYS.get(candidate.replace(/-/g, ""));
		if (hit) {
			usfm = hit;
			consumed = take;
			break;
		}
	}

	if (!usfm) {
		throw new ReferenceParseError(
			"UNKNOWN_BOOK",
			`Could not resolve a book from "${raw}". Use a USFM code (jhn) or an English name (john).`,
		);
	}

	const book = canonBook(usfm)!;
	const numbers = parts.slice(consumed);

	if (numbers.length === 0 || numbers.length > 3 || numbers.some((n) => !/^\d+$/.test(n))) {
		throw new ReferenceParseError(
			"INVALID_REFERENCE",
			`Expected {book}-{chapter}[-{verse}[-{endVerse}]], got "${raw}".`,
		);
	}

	const [chapter, startVerse, endVerse] = numbers.map(Number);

	if (chapter < 1 || chapter > book.chapters) {
		throw new ReferenceParseError(
			"CHAPTER_OUT_OF_RANGE",
			`${book.englishName} has ${book.chapters} chapter(s); got ${chapter}.`,
		);
	}

	if (startVerse === undefined) {
		return { usfm, book, chapter, startVerse: null, endVerse: null };
	}

	const end = endVerse ?? startVerse;
	if (startVerse < 1 || end < startVerse) {
		throw new ReferenceParseError(
			"INVALID_VERSE_RANGE",
			`Verse range ${startVerse}-${end} is not ascending.`,
		);
	}
	if (end - startVerse + 1 > MAX_RANGE_VERSES) {
		throw new ReferenceParseError(
			"RANGE_TOO_LARGE",
			`Ranges are capped at ${MAX_RANGE_VERSES} verses; request a whole chapter instead.`,
		);
	}

	return { usfm, book, chapter, startVerse, endVerse: end };
}

/** Human-readable form, e.g. "John 3:16-18". Mirrors formatStepReference's style. */
export function formatReference(ref: ParsedReference): string {
	const base = `${ref.book.englishName} ${ref.chapter}`;
	if (ref.startVerse === null) return base;
	if (ref.endVerse === null || ref.endVerse === ref.startVerse) return `${base}:${ref.startVerse}`;
	return `${base}:${ref.startVerse}-${ref.endVerse}`;
}

/** Canonical form used across the DB and by generated citations, e.g. "JHN 3:16". */
export function canonicalReference(ref: ParsedReference): string {
	if (ref.startVerse === null) return `${ref.usfm} ${ref.chapter}`;
	if (ref.endVerse === null || ref.endVerse === ref.startVerse) {
		return `${ref.usfm} ${ref.chapter}:${ref.startVerse}`;
	}
	return `${ref.usfm} ${ref.chapter}:${ref.startVerse}-${ref.endVerse}`;
}
