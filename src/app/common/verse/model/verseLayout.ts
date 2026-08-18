import type { Verse } from "./Verse";

/**
 * Turns api.bible's plain-text verse content into the block/line structure a
 * book-like reader needs.
 *
 * `verse.content` is stored verbatim from api.bible's `content-type=text`
 * output, which carries the passage's real formatting in whitespace:
 *
 *   - every verse ends with a trailing `\n`  — meaningless, always stripped
 *   - a whitespace-only line                 — PARAGRAPH break
 *   - a bare `\n` between two text lines     — LINE break (poetry)
 *   - a leading `¶` (KJV family)             — PARAGRAPH break
 *   - ` || ` (Literal Standard Version)      — LINE break
 *   - leading indent                         — poetry depth (2 = q1, 4 = q2)
 *
 * Two rules carry the whole thing: a blank line is a paragraph break, a bare
 * line break is a line of poetry. Everything else flows.
 */

/** Indent depth of a poetic line. Folded to two levels; q3+ is vanishingly rare. */
export type PoetryLevel = 0 | 1;

/**
 * A run of one verse's text on a single rendered line. A prose line holds one
 * part per verse it contains; a poetic line usually holds exactly one.
 */
export interface VersePart {
	verseNumber: number;
	text: string;
	/** True for the part that opens the verse — the only one that gets a number. */
	isVerseStart: boolean;
}

export interface LayoutLine {
	level: PoetryLevel;
	parts: VersePart[];
}

export interface ChapterBlock {
	/** Drives first-line indent vs. stanza spacing and hanging indents. */
	kind: "prose" | "poetry";
	lines: LayoutLine[];
}

type VerseItem =
	| { kind: "line"; indent: number; text: string }
	| { kind: "blank" };

interface ParsedVerse {
	startsParagraph: boolean;
	/** True when the verse used an explicit poetic line marker (LSV's `||`). */
	usesLineMarker: boolean;
	items: VerseItem[];
}

const PILCROW = /^([ \t]*)¶[ \t]*/;
const LSV_LINE_BREAK = /[ \t]*\|\|[ \t]*/g;

/**
 * Splits one verse's raw content into text lines and blank-line markers.
 *
 * Exported for testing; callers want `parseChapterBlocks`.
 */
export function parseVerseItems(content: string): ParsedVerse {
	let startsParagraph = false;

	let c = content.replace(/\r\n/g, "\n");
	const usesLineMarker = LSV_LINE_BREAK.test(c);
	LSV_LINE_BREAK.lastIndex = 0;

	// The LSV writes poetic line breaks as `||` instead of newlines. Re-indent
	// them to the verse's own base indent so the continuation lines line up with
	// the opening one rather than hanging off it.
	const baseIndent = /^[ \t]*/.exec(c)?.[0] ?? "";
	c = c.replace(PILCROW, (_m, spaces: string) => {
		startsParagraph = true;
		return spaces;
	});
	c = c.replace(LSV_LINE_BREAK, `\n${baseIndent}`);

	const items: VerseItem[] = c.split("\n").map((raw) =>
		raw.trim()
			? { kind: "line" as const, indent: (/^[ ]*/.exec(raw)?.[0] ?? "").length, text: raw.trim() }
			: { kind: "blank" as const },
	);

	// Every verse ends with a newline, so a trailing blank means nothing.
	while (items.length > 0 && items[items.length - 1].kind === "blank") items.pop();
	// A leading blank, however, is api.bible closing the previous paragraph.
	while (items.length > 0 && items[0].kind === "blank") {
		startsParagraph = true;
		items.shift();
	}

	return { startsParagraph, usesLineMarker, items };
}

/** Strips the layout markers, leaving one plain line of text. */
export function stripVerseMarkers(content: string): string {
	return content
		.replace(/\r\n/g, "\n")
		.replace(PILCROW, "")
		.replace(LSV_LINE_BREAK, " ")
		.replace(/\s+/g, " ")
		.trim();
}

export function parseChapterBlocks(verses: Verse[]): ChapterBlock[] {
	const sorted = [...verses].sort((a, b) => a.verseNumber - b.verseNumber);

	const blocks: ChapterBlock[] = [];
	let block: ChapterBlock | null = null;
	let line: LayoutLine | null = null;
	let prevBreaksLines = false;

	const openBlock = () => {
		block = { kind: "prose", lines: [] };
		blocks.push(block);
		line = null;
	};
	const openLine = (level: PoetryLevel) => {
		line = { level, parts: [] };
		block!.lines.push(line);
	};

	for (const verse of sorted) {
		const { startsParagraph, usesLineMarker, items } = parseVerseItems(verse.content);

		// A verse with no text at all still needs an anchor, or its #verse-N deep
		// link silently scrolls nowhere.
		if (items.length === 0) {
			if (!block) openBlock();
			if (!line) openLine(0);
			line!.parts.push({ verseNumber: verse.verseNumber, text: "", isVerseStart: true });
			continue;
		}

		// Blank lines split the verse into runs; each run after the first opens a
		// new paragraph, which is how a paragraph break lands mid-verse.
		const runs: Extract<VerseItem, { kind: "line" }>[][] = [[]];
		for (const item of items) {
			if (item.kind === "blank") runs.push([]);
			else runs[runs.length - 1].push(item);
		}

		let isFirstPartOfVerse = true;
		runs.forEach((run, runIndex) => {
			if (run.length === 0) return;

			const minIndent = Math.min(...run.map((l) => l.indent));
			/*
			 * Poetry is signalled by a shallow indent — what api.bible emits for a
			 * `\q1` line — or by the LSV's explicit `||` marker. A bare line break
			 * between two equally-indented lines is NOT enough: prose verses put a
			 * second speaker on their own line, and treating that as poetry would
			 * hang-indent an entire prose paragraph.
			 */
			const poetic = usesLineMarker || run.some((l) => l.indent === 2);
			// Poetry always breaks; so does any run that is written as several lines.
			const breaksLines = poetic || run.length > 1;

			if (!block || runIndex > 0 || (startsParagraph && runIndex === 0)) openBlock();
			if (poetic) block!.kind = "poetry";

			for (const item of run) {
				const level: PoetryLevel = item.indent - minIndent >= 2 ? 1 : 0;
				if (breaksLines || prevBreaksLines || !line) openLine(level);
				line!.parts.push({
					verseNumber: verse.verseNumber,
					text: item.text,
					isVerseStart: isFirstPartOfVerse,
				});
				isFirstPartOfVerse = false;
				prevBreaksLines = breaksLines;
			}
		});
	}

	return blocks;
}
