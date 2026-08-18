import { StudyStep } from "./StudyStep";

/**
 * A study step's passage as a human reference ("John 3:16", "Gen 1-3").
 *
 * Extracted from the two near-identical copies that had drifted apart in
 * SessionView and the sessions list: one accepted a localized book name and a
 * current-chapter override, the other did not, so the same step could read
 * "Juan 3" in the reader and "JHN 3" in the list.
 *
 * `bookName` is the book's name in the reader's translation; without it the raw
 * USFM code stands in. `currentChapter` narrows a multi-chapter step to the
 * chapter actually open.
 */
export function formatStepReference(
	step: StudyStep | undefined,
	bookName?: string,
	currentChapter?: number,
): string {
	if (!step) return "";

	const book = bookName || step.bookAbbreviation;
	if (!book) return "";

	const { startChapter, endChapter, startVerse, endVerse } = step;

	if (currentChapter) {
		if (startVerse && endVerse && startVerse !== endVerse) {
			return `${book} ${currentChapter}:${startVerse}-${endVerse}`;
		}
		if (startVerse) return `${book} ${currentChapter}:${startVerse}`;
		return `${book} ${currentChapter}`;
	}

	if (!startChapter) return book;

	if (startVerse && endVerse && startVerse !== endVerse) {
		return `${book} ${startChapter}:${startVerse}-${endVerse}`;
	}
	if (startVerse) return `${book} ${startChapter}:${startVerse}`;
	if (endChapter && endChapter !== startChapter) {
		return `${book} ${startChapter}-${endChapter}`;
	}
	return `${book} ${startChapter}`;
}

/** Canonical chapters a step covers — the denominator for "chapters studied". */
export function stepChapterCount(step: StudyStep): number {
	if (!step.startChapter) return 0;
	const end = step.endChapter ?? step.startChapter;
	return Math.max(1, end - step.startChapter + 1);
}
