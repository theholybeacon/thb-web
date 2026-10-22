import { canonBook, CANON } from "../../canon/model/canon";
import { StudyStepType } from "../../studyStep/model/StudyStepType";
import type { StudyStepInsert } from "../../studyStep/model/StudyStep";
import type { StudyBuilderDraft, StudyBuilderDraftStep } from "./StudyBuilder";

/**
 * Pure helpers for the plan a conversation assembles. No server imports: the
 * builder UI uses formatStepReference too.
 */

/** Matches the study / study_step column sizes, so a long AI answer can never fail the insert. */
const LIMITS = { name: 255, description: 1000, topic: 1000, title: 1000, explanation: 2000 } as const;
export const MAX_DRAFT_STEPS = 120;

const ENGLISH_NAME_TO_USFM = new Map(CANON.map((b) => [b.englishName.toLowerCase(), b.usfm]));

/** "1 Corinthians" → "1corinthians": names compared without spaces or punctuation. */
export const compactName = (name: string) => name.toLowerCase().normalize("NFD").replace(/[^\p{L}\p{N}]/gu, "");

const COMPACT_ENGLISH = CANON.map((b) => ({ usfm: b.usfm, name: compactName(b.englishName) }));

/**
 * "rom", "Romans", "ROM", "Mat", "1 Cor" → its USFM code. Older studies carry
 * loose abbreviations, so an unambiguous prefix of the English name counts too.
 * Unknown books come back null and their steps are dropped.
 */
export function toUsfm(book: unknown): string | null {
	if (typeof book !== "string") return null;
	const trimmed = book.trim();
	const upper = trimmed.toUpperCase();
	if (canonBook(upper)) return upper;
	const exact = ENGLISH_NAME_TO_USFM.get(trimmed.toLowerCase());
	if (exact) return exact;
	const compact = compactName(trimmed);
	if (compact.length < 2) return null;
	const matches = COMPACT_ENGLISH.filter((b) => b.name.startsWith(compact));
	return matches.length === 1 ? matches[0].usfm : null;
}

type Range = { start: number; end: number };

function parseRange(value: unknown): Range | null {
	if (value === null || value === undefined) return null;
	const text = String(value).trim();
	if (!text) return null;
	const match = text.match(/^(\d+)\s*(?:[-–]\s*(\d+))?$/);
	if (!match) return null;
	const start = Number(match[1]);
	const end = match[2] ? Number(match[2]) : start;
	if (start < 1 || end < start) return null;
	return { start, end };
}

const rangeText = (r: Range) => (r.start === r.end ? String(r.start) : `${r.start}-${r.end}`);

function clip(value: unknown, max: number): string {
	return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function clampScale(value: unknown, fallback: number): number {
	const n = Math.round(Number(value));
	return Number.isFinite(n) ? Math.min(10, Math.max(1, n)) : fallback;
}

/**
 * One step from the model, made safe to save. The step type is derived from the
 * reference rather than trusted: a "ChapterRange" whose chapter is "5" would
 * otherwise reach the parser and save an endChapter of NaN.
 */
export function normalizeStep(raw: unknown): StudyBuilderDraftStep | null {
	if (!raw || typeof raw !== "object") return null;
	const r = raw as Record<string, unknown>;
	const usfm = toUsfm(r.bookAbbreviation ?? r.book);
	if (!usfm) return null;
	const book = canonBook(usfm)!;

	let chapters = parseRange(r.chapterNumber ?? r.chapter);
	let verses = parseRange(r.verseNumber ?? r.verse);
	if (chapters) {
		if (chapters.start > book.chapters) return null;
		chapters = { start: chapters.start, end: Math.min(chapters.end, book.chapters) };
	}
	// Verses only make sense inside a single chapter.
	if (!chapters || chapters.start !== chapters.end) verses = null;

	let stepType: StudyStepType;
	if (!chapters) stepType = StudyStepType.FullBook;
	else if (chapters.start !== chapters.end) stepType = StudyStepType.ChapterRange;
	else if (!verses) stepType = StudyStepType.SingleChapter;
	else if (verses.start !== verses.end) stepType = StudyStepType.VerseRange;
	else stepType = StudyStepType.SingleVerse;

	const title = clip(r.title, LIMITS.title) || formatStepReference({ bookAbbreviation: usfm, chapterNumber: chapters && rangeText(chapters), verseNumber: verses && rangeText(verses) });

	return {
		bookAbbreviation: usfm,
		chapterNumber: chapters ? rangeText(chapters) : null,
		verseNumber: verses ? rangeText(verses) : null,
		stepType,
		title,
		explanation: clip(r.explanation, LIMITS.explanation),
	};
}

/** A whole plan from the model or the manual editor, or null when it is not one. */
export function normalizeDraft(raw: unknown): StudyBuilderDraft | null {
	if (!raw || typeof raw !== "object") return null;
	const r = raw as Record<string, unknown>;
	const steps = (Array.isArray(r.steps) ? r.steps : [])
		.map(normalizeStep)
		.filter((s): s is StudyBuilderDraftStep => s !== null)
		.slice(0, MAX_DRAFT_STEPS);
	const name = clip(r.name, LIMITS.name);
	if (!name && steps.length === 0) return null;
	return {
		name: name || "Untitled study",
		description: clip(r.description, LIMITS.description),
		topic: clip(r.topic, LIMITS.topic),
		length: clampScale(r.length, 5),
		depth: clampScale(r.depth, 5),
		steps,
	};
}

/**
 * "Romans 8", "Psalm 23:1-6", "Ruth". `names` are the books as the reader's
 * translation names them; without one, the English names stand in.
 */
export function formatStepReference(
	step: Pick<StudyBuilderDraftStep, "bookAbbreviation" | "chapterNumber" | "verseNumber">,
	names?: Map<string, string>,
): string {
	const name = names?.get(step.bookAbbreviation) ?? canonBook(step.bookAbbreviation)?.englishName ?? step.bookAbbreviation;
	if (!step.chapterNumber) return name;
	return step.verseNumber ? `${name} ${step.chapterNumber}:${step.verseNumber}` : `${name} ${step.chapterNumber}`;
}

/** A draft step as the study_step row it becomes. `studyId` is filled in by studyCreateSS. */
export function draftStepToInsert(step: StudyBuilderDraftStep, stepNumber: number): StudyStepInsert {
	const chapters = parseRange(step.chapterNumber);
	const verses = parseRange(step.verseNumber);
	return {
		studyId: "",
		stepNumber,
		stepType: step.stepType,
		title: step.title,
		explanation: step.explanation || `Read and meditate on ${formatStepReference(step)}.`,
		bookAbbreviation: step.bookAbbreviation,
		startChapter: chapters?.start ?? null,
		endChapter: chapters?.end ?? null,
		startVerse: verses?.start ?? null,
		endVerse: verses?.end ?? null,
	};
}

/** A study as it is saved, back as a plan the builder can keep working on. */
export function studyToDraft(study: {
	name: string;
	description: string | null;
	topic: string | null;
	length: number;
	depth: number;
	steps: Pick<StudyStepInsert, "bookAbbreviation" | "startChapter" | "endChapter" | "startVerse" | "endVerse" | "title" | "explanation">[];
}): StudyBuilderDraft {
	const range = (start?: number | null, end?: number | null) => (start ? (end && end !== start ? `${start}-${end}` : String(start)) : null);
	return normalizeDraft({
		name: study.name,
		description: study.description ?? "",
		topic: study.topic ?? "",
		length: study.length,
		depth: study.depth,
		steps: study.steps.map((s) => ({
			bookAbbreviation: s.bookAbbreviation,
			chapterNumber: range(s.startChapter, s.endChapter),
			verseNumber: range(s.startVerse, s.endVerse),
			title: s.title,
			explanation: s.explanation,
		})),
	}) ?? { name: study.name, description: "", topic: "", length: 5, depth: 5, steps: [] };
}

/** What makes two steps the same reading: the passage, not its wording. */
export const stepKey = (s: Pick<StudyBuilderDraftStep, "bookAbbreviation" | "chapterNumber" | "verseNumber">) =>
	`${s.bookAbbreviation}|${s.chapterNumber ?? ""}|${s.verseNumber ?? ""}`;

export type StepSync = {
	/** Saved steps that stay, with their place in the new plan. */
	keep: { id: string; index: number }[];
	/** Positions in the new plan that need a new row. */
	insert: number[];
	/** Saved steps the plan no longer has, with the position whose step takes over their sessions. */
	remove: { id: string; successor: number }[];
};

/**
 * How a saved study's steps become an edited plan without losing anyone's
 * place: a reading that is still in the plan keeps its row (and with it the
 * sessions on it and the steps marked done), wherever it moved to. Only
 * readings that left the plan are deleted; a session standing on one moves to
 * whatever now sits at that position.
 */
export function planStepSync(saved: { id: string; key: string }[], steps: StudyBuilderDraftStep[]): StepSync {
	const pool = new Map<string, string[]>();
	for (const s of saved) pool.set(s.key, [...(pool.get(s.key) ?? []), s.id]);
	const keep: StepSync["keep"] = [];
	const insert: number[] = [];
	steps.forEach((step, index) => {
		const id = pool.get(stepKey(step))?.shift();
		if (id) keep.push({ id, index });
		else insert.push(index);
	});
	const kept = new Set(keep.map((k) => k.id));
	const remove = saved
		.map((s, position) => ({ id: s.id, successor: Math.min(position, steps.length - 1) }))
		.filter((s) => !kept.has(s.id));
	return { keep, insert, remove };
}

export type PassageQuery = {
	/** Books whose name starts with what was typed. */
	books: string[];
	/** A full reference, when the query names one ("John 3:16", "Psalm 23", "Ruth"). */
	reference: Pick<StudyBuilderDraftStep, "bookAbbreviation" | "chapterNumber" | "verseNumber"> | null;
};

/**
 * What the manual finder makes of its search box: "rom" lists Romans, "jn 3:16"
 * or "Juan 3:16-18" is a passage ready to add. `names` are the books as the
 * reader's translation names them; English names and USFM codes always work.
 */
export function parsePassageQuery(query: string, names: Map<string, string> = new Map()): PassageQuery {
	const text = query.trim();
	if (!text) return { books: [], reference: null };
	// "1 John 3:16" — the book is everything before the first number that is not its own leading digit.
	const match = text.match(/^(\d?\s*[^\d]+?)\s*(\d+(?:\s*[-–]\s*\d+)?)?\s*(?::\s*(\d+(?:\s*[-–]\s*\d+)?))?\s*$/u);
	const bookPart = compactName(match?.[1] ?? text);
	if (!bookPart) return { books: [], reference: null };

	const books = CANON.filter((b) => {
		const candidates = [b.usfm, b.englishName, names.get(b.usfm) ?? ""].map(compactName).filter(Boolean);
		return candidates.some((c) => c.startsWith(bookPart));
	}).map((b) => b.usfm);
	if (!match || books.length === 0) return { books, reference: null };

	// A name typed in full wins over the longer names it starts ("Jude" over "Judges").
	const exact = books.find((usfm) => [usfm, canonBook(usfm)!.englishName, names.get(usfm) ?? ""].map(compactName).includes(bookPart));
	const usfm = exact ?? (books.length === 1 ? books[0] : null);
	if (!usfm) return { books, reference: null };
	const step = normalizeStep({ bookAbbreviation: usfm, chapterNumber: match[2]?.replace(/\s/g, "") ?? null, verseNumber: match[3]?.replace(/\s/g, "") ?? null });
	if (!step || (match[2] && !step.chapterNumber)) return { books, reference: null };
	return { books, reference: { bookAbbreviation: step.bookAbbreviation, chapterNumber: step.chapterNumber, verseNumber: step.verseNumber } };
}
