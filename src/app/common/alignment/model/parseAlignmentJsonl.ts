import { extractStrongs, normalizeSurface } from "@/lib/strongs";

/**
 * One verse as emitted by scripts/alignment/extract_sword.py. Keys are terse
 * because the corpus is ~800k words and the files ship over the network:
 * b=book, c=chapter, v=verse, w=words, s=surface, l=lemma attr, m=morph.
 */
export interface AlignmentJsonlVerse {
	b: string;
	c: number;
	v: number;
	w: { s: string; l: string; m?: string }[];
}

/** A row ready for `alignment_word`, independent of how it will be written. */
export interface ParsedAlignmentWord {
	sourceCode: string;
	bookAbbreviation: string;
	chapter: number;
	verse: number;
	wordIndex: number;
	occurrence: number;
	surface: string;
	surfaceNorm: string;
	strongs: string[];
	lemma: string | null;
	morph: string | null;
}

/**
 * Turns one JSONL verse into `alignment_word` rows.
 *
 * SHARED ON PURPOSE — both the bulk seeder (scripts/import-alignment.ts) and the
 * runtime lazy loader (alignmentBookEnsureSS) must derive rows identically. The
 * `occurrence` ordinal in particular is load-bearing: it is what distinguishes
 * "the 2nd `love` in John 21:17" from the 1st, and those two resolve to
 * *different* Greek words. If a second implementation ever counted it slightly
 * differently, lazily-loaded books would return the wrong lemma while seeded
 * books returned the right one — a silent, per-book correctness split that the
 * anchor fixture would only catch on whichever path it happened to run against.
 */
export function parseAlignmentVerse(
	sourceCode: string,
	verse: AlignmentJsonlVerse,
): ParsedAlignmentWord[] {
	const out: ParsedAlignmentWord[] = [];

	// Counted per normalised surface, within this verse, in reading order —
	// the same order and normalisation the browser applies to a selection.
	const counts = new Map<string, number>();
	let wordIndex = 0;

	for (const word of verse.w) {
		const surfaceNorm = normalizeSurface(word.s);
		if (!surfaceNorm) continue;

		const occurrence = (counts.get(surfaceNorm) ?? 0) + 1;
		counts.set(surfaceNorm, occurrence);

		out.push({
			sourceCode,
			bookAbbreviation: verse.b,
			chapter: verse.c,
			verse: verse.v,
			wordIndex,
			occurrence,
			surface: word.s,
			surfaceNorm,
			strongs: extractStrongs(word.l),
			lemma: cleanLemma(word.l),
			morph: word.m?.trim() || null,
		});
		wordIndex++;
	}

	return out;
}

/**
 * The original-language headword, stripped of the source's own annotations:
 * `lemma.BSBlex:ἀγαπᾷς strong:G25` -> `ἀγαπᾷς`.
 */
function cleanLemma(raw: string | undefined): string | null {
	if (!raw) return null;
	return (
		raw
			.replace(/lemma\.[A-Za-z]+:/g, "")
			.replace(/\s*[Ss]trong:[GgHh]\d+/g, "")
			.trim() || null
	);
}

/** Parses a whole NDJSON payload. Blank lines and malformed rows are skipped. */
export function parseAlignmentJsonl(sourceCode: string, text: string): ParsedAlignmentWord[] {
	const rows: ParsedAlignmentWord[] = [];
	for (const line of text.split("\n")) {
		if (!line.trim()) continue;
		let verse: AlignmentJsonlVerse;
		try {
			verse = JSON.parse(line) as AlignmentJsonlVerse;
		} catch {
			continue;
		}
		if (!verse?.b || !verse.w) continue;
		rows.push(...parseAlignmentVerse(sourceCode, verse));
	}
	return rows;
}
