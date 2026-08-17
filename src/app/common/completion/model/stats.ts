import {
	CANON,
	NT_CHAPTERS,
	OT_CHAPTERS,
	TOTAL_CHAPTERS,
	canonBook,
} from "@/app/common/canon/model/canon";
import { BookProgress, ChapterTally } from "./Completion";

/**
 * Turn the raw per-chapter tallies into the grid + the headline counts.
 *
 * Pure — no I/O — so the private stats page, the public profile and the OG share
 * card all derive their numbers the same way, and so the laps rule can be tested
 * without a database.
 *
 * `names` maps USFM -> the book name in the user's own Bible (already localized
 * per translation). Anything missing falls back to the canon's English name.
 *
 * Tallies for books outside the 66-book canon (deuterocanon, which some
 * translations carry) are ignored here: they are stored, but a shareable "% of
 * the Bible" has to mean the same thing for everyone.
 */
export function buildBookProgress(
	tallies: ChapterTally[],
	names: Record<string, string> = {},
): BookProgress[] {
	const byBook = new Map<string, Map<number, number>>();
	for (const t of tallies) {
		if (!canonBook(t.bookAbbreviation)) continue;
		let chapters = byBook.get(t.bookAbbreviation);
		if (!chapters) {
			chapters = new Map();
			byBook.set(t.bookAbbreviation, chapters);
		}
		chapters.set(t.chapter, t.times);
	}

	return CANON.map((book) => {
		const tallied = byBook.get(book.usfm);
		const times: number[] = new Array(book.chapters).fill(0);
		let completed = 0;

		if (tallied) {
			for (const [chapter, count] of tallied) {
				// Guard against a chapter number outside this book (bad data, or a
				// translation that splits chapters differently).
				if (chapter < 1 || chapter > book.chapters) continue;
				times[chapter - 1] = count;
				if (count > 0) completed++;
			}
		}

		return {
			usfm: book.usfm,
			name: names[book.usfm] ?? book.englishName,
			testament: book.testament,
			chapters: book.chapters,
			completed,
			times,
		};
	});
}

export type CoverageTotals = {
	completedChapters: number;
	percent: number;
	otCompleted: number;
	ntCompleted: number;
	booksCompleted: number;
	booksStarted: number;
	booksUntouched: number;
	laps: number;
	chaptersTowardNextLap: number;
};

/**
 * Headline numbers from the grid.
 *
 * `laps` is the number of complete passes through the whole canon: the minimum
 * times-read across all 1189 chapters. One unread chapter anywhere holds it at
 * 0, which is the honest answer to "how many times have you read the Bible".
 * `chaptersTowardNextLap` counts the chapters already read beyond that floor, so
 * the UI can show progress toward the next pass.
 */
export function computeCoverage(books: BookProgress[]): CoverageTotals {
	let completedChapters = 0;
	let otCompleted = 0;
	let ntCompleted = 0;
	let booksCompleted = 0;
	let booksStarted = 0;
	let minTimes = Infinity;
	let chaptersTowardNextLap = 0;

	for (const book of books) {
		completedChapters += book.completed;
		if (book.testament === "OT") otCompleted += book.completed;
		else ntCompleted += book.completed;

		if (book.completed > 0) booksStarted++;
		if (book.completed === book.chapters) booksCompleted++;

		for (const times of book.times) {
			if (times < minTimes) minTimes = times;
		}
	}

	const laps = minTimes === Infinity ? 0 : minTimes;
	for (const book of books) {
		for (const times of book.times) {
			if (times > laps) chaptersTowardNextLap++;
		}
	}

	return {
		completedChapters,
		percent: Math.round((completedChapters / TOTAL_CHAPTERS) * 1000) / 10,
		otCompleted,
		ntCompleted,
		booksCompleted,
		booksStarted,
		booksUntouched: books.length - booksStarted,
		laps,
		chaptersTowardNextLap,
	};
}

export const CHAPTER_TOTALS = {
	total: TOTAL_CHAPTERS,
	ot: OT_CHAPTERS,
	nt: NT_CHAPTERS,
};
