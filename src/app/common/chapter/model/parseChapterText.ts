/**
 * Splits one chapter of api.bible `content-type=text` output into verses.
 *
 * WHY TEXT AND NOT HTML/JSON: `verse.content` is stored verbatim from
 * api.bible's text output, and its whitespace is load-bearing — every reading
 * mode renders paragraphs, poetry lines and indent depth from it (see
 * src/app/common/verse/model/verseLayout.ts). Stripping tags out of the HTML
 * form would flatten that layout and leave newly fetched chapters inconsistent
 * with the tens of thousands of verses already stored. Requesting the chapter
 * as text keeps the stored format byte-compatible with the per-verse fetch this
 * replaces, so the only thing that changes is the number of HTTP requests.
 *
 * With `include-verse-numbers=true` the payload marks each verse with a
 * bracketed number:
 *
 *     [1] En el principio creó Dios los cielos y la tierra.
 *     [2] Y la tierra estaba desordenada y vacía...
 *
 * The marker is the only structure we consume; everything between two markers
 * is kept exactly as it arrived, minus the marker and the single space that
 * follows it.
 */

/** `[12]` — a verse marker. Bracketed digits only, so `[a]` footnote keys miss. */
const VERSE_MARKER = /\[(\d+)\]/g;

export interface ParsedVerse {
	verseNumber: number;
	content: string;
}

/**
 * Returns [] when the text carries no usable markers. Callers must treat that
 * as a failure rather than as an empty chapter — a 200 with no verses means the
 * payload shape changed, not that the chapter is blank.
 */
export function parseChapterText(text: string): ParsedVerse[] {
	if (!text) return [];

	// Marker positions in document order.
	const marks: { verse: number; start: number; end: number }[] = [];
	VERSE_MARKER.lastIndex = 0;
	for (let m = VERSE_MARKER.exec(text); m; m = VERSE_MARKER.exec(text)) {
		const verse = Number(m[1]);
		if (!Number.isInteger(verse) || verse < 1) continue;
		marks.push({ verse, start: m.index, end: m.index + m[0].length });
	}
	if (marks.length === 0) return [];

	// A bracketed number inside the prose would otherwise open a bogus verse and
	// swallow the rest of the real one. Verse numbers never go backwards, so a
	// marker that would rewind the count is not a verse marker.
	//
	// A marker REPEATING the current number is kept: that is how a verse split
	// across two paragraphs is marked, and dropping it would leave the literal
	// "[7]" sitting in the rendered text. The pieces are rejoined below.
	const ordered: typeof marks = [];
	let highest = 0;
	for (const mark of marks) {
		if (mark.verse < highest) continue;
		ordered.push(mark);
		highest = mark.verse;
	}

	// Same verse can be marked twice when it spans a paragraph; join the pieces.
	const byVerse = new Map<number, string[]>();
	for (let i = 0; i < ordered.length; i++) {
		const mark = ordered[i];
		const segment = text.slice(mark.end, ordered[i + 1]?.start ?? text.length);

		// Whitespace BEFORE the marker is the verse's own indentation — poetry
		// depth and paragraph breaks live there, so it belongs to this verse, not
		// to the previous one. Recover it from the tail of the preceding segment.
		const prev = byVerse.get(ordered[i - 1]?.verse ?? -1);
		let indent = "";
		if (prev && prev.length > 0) {
			const last = prev[prev.length - 1];
			const trailing = last.match(/[ \t]*$/)?.[0] ?? "";
			if (trailing) {
				prev[prev.length - 1] = last.slice(0, last.length - trailing.length);
				indent = trailing;
			}
		}

		// Exactly one separator space after the marker is formatting, not content.
		const body = segment.startsWith(" ") ? segment.slice(1) : segment;

		const parts = byVerse.get(mark.verse) ?? [];
		parts.push(indent + body);
		byVerse.set(mark.verse, parts);
	}

	const out: ParsedVerse[] = [];
	for (const [verseNumber, parts] of byVerse) {
		const content = parts.join("");
		if (content.trim().length === 0) continue;
		out.push({ verseNumber, content });
	}
	out.sort((a, b) => a.verseNumber - b.verseNumber);
	return out;
}
