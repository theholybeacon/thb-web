"use client";

import { useEffect, useRef, useState } from "react";
import { normalizeSurface } from "@/lib/strongs";

export interface ReaderSelection {
	/** The highlighted text, whitespace-collapsed. */
	text: string;
	verseNumber: number;
	/**
	 * 1-based ordinal of this text among identical tokens in the same verse.
	 * "the 2nd `love` in John 21:17" resolves to a different Greek word from the
	 * 1st, so alignment is meaningless without it.
	 */
	occurrence: number;
	/** Changes on every new selection, so effects re-run on a re-select. */
	nonce: number;
}

/** Below this a selection is a stray tap, above it a sentence. */
const MIN_LENGTH = 2;
const MAX_LENGTH = 80;
/**
 * Applied to the raw selection before it is cloned, so a select-all over a long
 * chapter never clones its whole subtree. Safe as a pre-filter: cleaning only
 * ever shortens the text.
 */
const MAX_RAW_LENGTH = MAX_LENGTH * 4;
/** Long enough to ride out a drag, short enough to feel instant. */
const DEBOUNCE_MS = 180;

function verseElementsFor(verseNumber: number): HTMLElement[] {
	return Array.from(
		document.querySelectorAll<HTMLElement>(`[data-verse="${verseNumber}"] [data-verse-text]`),
	);
}

/**
 * Character offset of (node, offset) within the verse's concatenated text, or
 * -1 if the node is not part of it. Walking text nodes in document order is the
 * only reliable way to do this: a verse is rendered as several sibling spans
 * (one per line it flows across) and its text nodes are interleaved with
 * character links.
 */
function offsetWithinVerse(elements: HTMLElement[], node: Node, nodeOffset: number): number {
	let seen = 0;
	for (const element of elements) {
		const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
		let current = walker.nextNode();
		while (current) {
			if (current === node) return seen + nodeOffset;
			seen += current.textContent?.length ?? 0;
			current = walker.nextNode();
		}
	}
	return -1;
}

function verseTextOf(elements: HTMLElement[]): string {
	return elements.map((el) => el.textContent ?? "").join("");
}

/**
 * The selection as scripture text — the verse number stripped back out.
 *
 * Double-clicking the first word of a verse selects "16In", not "In": the number
 * sits directly against the text with no whitespace between them, and Unicode
 * word segmentation does not break between a digit and a letter, so the two are
 * one word to the browser. `select-none` keeps a drag out of the number but has
 * no say over word expansion, and browsers disagree on whether it even excludes
 * the text from `Selection.toString()` — hence reading the range itself.
 *
 * Cloning covers both ends: a number fully inside the selection is cloned whole
 * and dropped by the selector, and a partially selected one is cloned inside its
 * own element (the DOM clones partially contained ancestors) and dropped with
 * it. Text under an ancestor the range merely sits inside is untouched, so
 * selecting a word mid-verse passes through unchanged.
 */
function selectedScriptureText(range: Range): string {
	const fragment = range.cloneContents();
	fragment.querySelectorAll("[data-verse-number]").forEach((el) => el.remove());
	return (fragment.textContent ?? "").replace(/\s+/g, " ").trim();
}

/**
 * Counts which occurrence of `token` the selection is, by normalising the verse
 * text up to the selection point and counting matches. Normalisation must match
 * what the importer stored, or the ordinal will not line up with the DB.
 */
function occurrenceOf(verseText: string, upToOffset: number, token: string): number {
	const before = normalizeSurface(verseText.slice(0, upToOffset));
	const needle = normalizeSurface(token);
	if (!needle) return 1;

	// Whole-token matches only: "love" must not be counted inside "beloved".
	// Scanned manually rather than with a lookbehind regex — lookbehind is absent
	// from older Safari, where it would throw at construction and silently reduce
	// every selection to occurrence 1.
	const isWordChar = (ch: string | undefined) => ch !== undefined && /[\p{L}\p{N}]/u.test(ch);

	let count = 0;
	let from = 0;
	for (;;) {
		const at = before.indexOf(needle, from);
		if (at === -1) break;
		if (!isWordChar(before[at - 1]) && !isWordChar(before[at + needle.length])) count++;
		from = at + 1;
	}
	return count + 1;
}

/**
 * Reports the reader's current text selection, resolved to a verse and to the
 * occurrence of that text within the verse.
 *
 * Fires on `selectionchange` (debounced) rather than `mouseup` so it also works
 * for keyboard and touch selection. Type mode is `select-none` across its whole
 * tree, so it produces no selection and needs no special-casing here.
 */
export function useTextSelection(enabled = true): ReaderSelection | null {
	const [selection, setSelection] = useState<ReaderSelection | null>(null);
	const nonce = useRef(0);

	useEffect(() => {
		if (!enabled) return;

		let timer: ReturnType<typeof setTimeout> | undefined;

		const evaluate = () => {
			const domSelection = window.getSelection();
			if (!domSelection || domSelection.isCollapsed || domSelection.rangeCount === 0) return;

			if (domSelection.toString().length > MAX_RAW_LENGTH) return;

			const range = domSelection.getRangeAt(0);
			const text = selectedScriptureText(range);
			if (text.length < MIN_LENGTH || text.length > MAX_LENGTH) return;
			// Punctuation-only drags are not lookups.
			if (!/\p{L}/u.test(text)) return;

			const anchor =
				range.startContainer.nodeType === Node.ELEMENT_NODE
					? (range.startContainer as Element)
					: range.startContainer.parentElement;
			const verseEl = anchor?.closest<HTMLElement>("[data-verse]");
			const verseNumber = Number(verseEl?.dataset.verse);
			if (!Number.isInteger(verseNumber) || verseNumber <= 0) return;

			const elements = verseElementsFor(verseNumber);
			if (elements.length === 0) return;

			const offset = offsetWithinVerse(elements, range.startContainer, range.startOffset);
			const occurrence =
				offset < 0 ? 1 : occurrenceOf(verseTextOf(elements), offset, text);

			nonce.current += 1;
			setSelection({ text, verseNumber, occurrence, nonce: nonce.current });
		};

		const onSelectionChange = () => {
			clearTimeout(timer);
			timer = setTimeout(evaluate, DEBOUNCE_MS);
		};

		document.addEventListener("selectionchange", onSelectionChange);
		return () => {
			clearTimeout(timer);
			document.removeEventListener("selectionchange", onSelectionChange);
		};
	}, [enabled]);

	return selection;
}
