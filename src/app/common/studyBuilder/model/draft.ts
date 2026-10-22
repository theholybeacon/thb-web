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

/** "rom", "Romans", "ROM" → "ROM". Unknown books come back null and their steps are dropped. */
export function toUsfm(book: unknown): string | null {
	if (typeof book !== "string") return null;
	const trimmed = book.trim();
	const upper = trimmed.toUpperCase();
	if (canonBook(upper)) return upper;
	return ENGLISH_NAME_TO_USFM.get(trimmed.toLowerCase()) ?? null;
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

/** A whole plan from the model, or null when it is not one. */
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

/** "Romans 8", "Psalm 23:1-6", "Ruth" — English fallback names, like the journey grid. */
export function formatStepReference(step: Pick<StudyBuilderDraftStep, "bookAbbreviation" | "chapterNumber" | "verseNumber">): string {
	const name = canonBook(step.bookAbbreviation)?.englishName ?? step.bookAbbreviation;
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
