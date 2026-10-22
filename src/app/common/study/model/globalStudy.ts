import { CANON, canonBook } from "@/app/common/canon/model/canon";
import { StudyStepType } from "@/app/common/studyStep/model/StudyStepType";
import { StudyStepInsert } from "@/app/common/studyStep/model/StudyStep";
import { StepContent, stepContentProblems } from "@/app/common/studyStep/model/StepContent";
import { StudyKind } from "./StudyKind";

/**
 * A global study is a reading plan authored here in code, not by the AI and not
 * by a user, and seeded into the `study` table by scripts/seed-global-studies.ts.
 *
 * It lives as data rather than as rows-in-a-migration so that the plan can be
 * reviewed in a diff, validated (see validateGlobalStudy) and re-seeded after an
 * edit. The seeded row is a template: it has no owner and no translation, and a
 * reader "adopts" it, which copies it into their account in their own Bible.
 */

/**
 * One passage in a plan. Omitting the chapters means the whole book. Verses
 * narrow a single chapter (startChapter only): the reader applies the verse
 * range to every chapter of a step, so a range cannot cross a chapter break.
 */
export type GlobalScriptureStepDef = {
	kind?: "scripture";
	/** USFM code, matching `canon.usfm` and `study_step.bookAbbreviation`. */
	book: string;
	startChapter?: number;
	endChapter?: number;
	startVerse?: number;
	endVerse?: number;
	title: string;
	explanation: string;
};

/**
 * A step that is not Scripture: text, a reflection, a character, an image, a
 * video or a link. Its material is `content` (see StepContent).
 */
export type GlobalContentStepDef = {
	title: string;
	/** A line under the title. Optional: the content usually says it all. */
	explanation?: string;
	content: StepContent;
	/**
	 * Reflection steps only: the passage the reader's answer is saved against as
	 * a note. Without it the note is saved on the Bible the study is read in.
	 */
	anchor?: { book: string; chapter: number; verse?: number };
};

export type GlobalStudyStepDef = GlobalScriptureStepDef | GlobalContentStepDef;

export function isScriptureStepDef(step: GlobalStudyStepDef): step is GlobalScriptureStepDef {
	return !("content" in step);
}

export type GlobalStudyDef = {
	/** Stable identity across re-seeds. Also the catalog URL segment. */
	slug: string;
	/** Defaults to "plan". */
	kind?: StudyKind;
	/** ISO 639-1 language the study is written in. Defaults to "en". */
	language?: string;
	name: string;
	description: string;
	/** Stored on the study; the AI never sees it, but the copy keeps it readable. */
	topic: string;
	length: number;
	depth: number;
	sortOrder: number;
	/**
	 * True when the plan claims to cover the whole 66-book canon, which turns on
	 * the exact-coverage check in validateGlobalStudy. A topical plan sets false.
	 */
	coversWholeCanon: boolean;
	steps: GlobalStudyStepDef[];
};

/** Resolved chapter span of a step — a whole-book step means chapters 1..n. */
export function stepChapterSpan(step: GlobalScriptureStepDef): { start: number; end: number } | null {
	const book = canonBook(step.book);
	const start = step.startChapter ?? 1;
	const end = step.endChapter ?? step.startChapter ?? book?.chapters;
	if (!end) return null;
	return { start, end };
}

function stepType(step: GlobalScriptureStepDef): StudyStepType {
	const book = canonBook(step.book);
	const span = stepChapterSpan(step);
	if (!span) return StudyStepType.FullBook;
	if (step.startVerse) {
		return step.endVerse && step.endVerse !== step.startVerse ? StudyStepType.VerseRange : StudyStepType.SingleVerse;
	}
	if (book && span.start === 1 && span.end === book.chapters) return StudyStepType.FullBook;
	if (span.start === span.end) return StudyStepType.SingleChapter;
	return StudyStepType.ChapterRange;
}

/**
 * Turns a plan into insertable steps. `studyId` is left to the caller, exactly
 * as studyCreateSS does with AI-generated steps.
 *
 * A whole-book step is written out with explicit start/end chapters rather than
 * NULLs: SessionView resolves a NULL endChapter by querying the book row for its
 * chapter count, which is one round-trip per step and depends on the reader's
 * translation agreeing with us about the book's length.
 */
export function globalStudyStepInserts(def: GlobalStudyDef): Omit<StudyStepInsert, "studyId">[] {
	return def.steps.map((step, index) => {
		if (!isScriptureStepDef(step)) {
			return {
				stepNumber: index + 1,
				kind: step.content.kind,
				stepType: null,
				title: step.title,
				explanation: step.explanation ?? "",
				content: step.content,
				bookAbbreviation: step.anchor?.book ?? null,
				startChapter: step.anchor?.chapter ?? null,
				endChapter: step.anchor?.chapter ?? null,
				startVerse: step.anchor?.verse ?? null,
				endVerse: step.anchor?.verse ?? null,
			};
		}
		const span = stepChapterSpan(step);
		return {
			stepNumber: index + 1,
			kind: "scripture",
			stepType: stepType(step),
			title: step.title,
			explanation: step.explanation,
			content: null,
			bookAbbreviation: step.book,
			startChapter: span?.start ?? null,
			endChapter: span?.end ?? null,
			startVerse: step.startVerse ?? null,
			endVerse: step.startVerse ? (step.endVerse ?? step.startVerse) : null,
		};
	});
}

/**
 * Everything that has to be true before a plan is allowed near the database.
 *
 * A reading plan is long, hand-written data, and the failure mode is silent: a
 * fat-fingered chapter number does not throw, it just quietly drops Malachi 3
 * out of "the whole Bible". So the seed script refuses to run on any problem
 * reported here.
 */
export function validateGlobalStudy(def: GlobalStudyDef): string[] {
	const problems: string[] = [];
	const seen = new Map<string, number[]>();

	def.steps.forEach((step, index) => {
		if (!isScriptureStepDef(step)) {
			const label = `step ${index + 1} (${step.content?.kind ?? "?"})`;
			for (const problem of stepContentProblems({ kind: step.content?.kind, content: step.content })) {
				problems.push(`${label}: ${problem}`);
			}
			if (!step.title.trim()) problems.push(`${label}: empty title`);
			if (step.title.length > 1000) problems.push(`${label}: title over 1000 chars`);
			if ((step.explanation?.length ?? 0) > 2000) problems.push(`${label}: explanation over 2000 chars`);
			if (step.anchor) {
				if (step.content?.kind !== "reflection") problems.push(`${label}: only a reflection has an anchor`);
				const book = canonBook(step.anchor.book);
				if (!book) problems.push(`${label}: anchor "${step.anchor.book}" is not a canonical USFM code`);
				else if (step.anchor.chapter < 1 || step.anchor.chapter > book.chapters) {
					problems.push(`${label}: anchor outside ${book.usfm} 1-${book.chapters}`);
				}
			}
			return;
		}

		const label = `step ${index + 1} (${step.book} ${step.startChapter ?? ""}-${step.endChapter ?? ""})`;
		const book = canonBook(step.book);
		if (!book) {
			problems.push(`${label}: "${step.book}" is not a canonical USFM code`);
			return;
		}
		const span = stepChapterSpan(step);
		if (!span) {
			problems.push(`${label}: chapter span could not be resolved`);
			return;
		}
		if (span.start < 1 || span.end > book.chapters || span.start > span.end) {
			problems.push(`${label}: outside ${book.usfm} 1-${book.chapters}`);
			return;
		}
		if (step.startVerse !== undefined || step.endVerse !== undefined) {
			if (step.startVerse === undefined) problems.push(`${label}: endVerse without startVerse`);
			else if (span.start !== span.end) problems.push(`${label}: a verse range must stay in one chapter`);
			else if (step.startVerse < 1 || (step.endVerse !== undefined && step.endVerse < step.startVerse)) {
				problems.push(`${label}: verses ${step.startVerse}-${step.endVerse ?? ""} are out of order`);
			} else if ((step.endVerse ?? step.startVerse) > 176) {
				problems.push(`${label}: no chapter has verse ${step.endVerse ?? step.startVerse}`);
			}
		}
		if (!step.title.trim()) problems.push(`${label}: empty title`);
		if (!step.explanation.trim()) problems.push(`${label}: empty explanation`);
		// The columns are varchar-bounded; an over-long string is a runtime insert
		// error, which is a miserable way to find out about a typo.
		if (step.title.length > 1000) problems.push(`${label}: title over 1000 chars`);
		if (step.explanation.length > 2000) problems.push(`${label}: explanation over 2000 chars`);

		const chapters = seen.get(book.usfm) ?? [];
		for (let c = span.start; c <= span.end; c++) chapters.push(c);
		seen.set(book.usfm, chapters);
	});

	if (!def.steps.length) problems.push("no steps");
	if (!def.steps.some(isScriptureStepDef)) problems.push("no scripture step: a study reads the Bible");
	if (def.language !== undefined && !/^[a-z]{2}$/.test(def.language)) problems.push(`language "${def.language}" is not an ISO 639-1 code`);

	if (def.coversWholeCanon) {
		for (const book of CANON) {
			const chapters = seen.get(book.usfm) ?? [];
			const counts = new Map<number, number>();
			for (const c of chapters) counts.set(c, (counts.get(c) ?? 0) + 1);

			const missing: number[] = [];
			for (let c = 1; c <= book.chapters; c++) if (!counts.has(c)) missing.push(c);
			const repeated = [...counts.entries()].filter(([, n]) => n > 1).map(([c]) => c);

			if (missing.length) problems.push(`${book.usfm}: missing chapters ${summarize(missing)}`);
			if (repeated.length) problems.push(`${book.usfm}: chapters read twice ${summarize(repeated)}`);
		}
	}

	if (def.description.length > 1000) problems.push("description over 1000 chars");
	if (def.name.length > 255) problems.push("name over 255 chars");
	if (def.topic.length > 1000) problems.push("topic over 1000 chars");

	return problems;
}

/** "1-3, 7, 10-12" — readable in a failed-seed message. */
function summarize(chapters: number[]): string {
	const sorted = [...new Set(chapters)].sort((a, b) => a - b);
	const runs: string[] = [];
	let start = sorted[0];
	let prev = sorted[0];
	for (const c of sorted.slice(1)) {
		if (c === prev + 1) { prev = c; continue; }
		runs.push(start === prev ? `${start}` : `${start}-${prev}`);
		start = c;
		prev = c;
	}
	if (sorted.length) runs.push(start === prev ? `${start}` : `${start}-${prev}`);
	return runs.join(", ");
}

/** Total canonical chapters a plan covers — shown on the catalog card. */
export function globalStudyChapterCount(def: GlobalStudyDef): number {
	return def.steps.reduce((total, step) => {
		if (!isScriptureStepDef(step)) return total;
		const span = stepChapterSpan(step);
		return total + (span ? span.end - span.start + 1 : 0);
	}, 0);
}
