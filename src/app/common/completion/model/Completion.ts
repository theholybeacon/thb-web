import { chapterCompletionTable } from "@/db/schema/chapterCompletion";
import { userBadgeTable } from "@/db/schema/userBadge";
import { StreakInfo } from "@/app/common/activity/model/Activity";

export type ChapterCompletion = typeof chapterCompletionTable.$inferSelect;
export type ChapterCompletionInsert = typeof chapterCompletionTable.$inferInsert;
export type UserBadge = typeof userBadgeTable.$inferSelect;

/** How a chapter was consumed. Mirrors the reader's three modes, plus self-report. */
export const COMPLETION_MODES = ["read", "listen", "type", "manual"] as const;
export type CompletionMode = (typeof COMPLETION_MODES)[number];

export function isCompletionMode(value: string): value is CompletionMode {
	return (COMPLETION_MODES as readonly string[]).includes(value);
}

/**
 * A user's Nth pass through one chapter. `times` is how many laps they have
 * completed of it; 0 means untouched.
 */
export type ChapterTally = {
	bookAbbreviation: string;
	chapter: number;
	times: number;
};

/** One canonical book's row in the completion grid. */
export type BookProgress = {
	usfm: string;
	/** Localized where possible (from the user's Bible), else the canon fallback. */
	name: string;
	testament: "OT" | "NT";
	chapters: number;
	completed: number;
	/** Times read per chapter, index 0 = chapter 1. Length === `chapters`. */
	times: number[];
};

export type ModeTotals = { chapters: number; seconds: number };

export type TimeframeCounts = {
	today: number;
	week: number;
	month: number;
	year: number;
};

export type EarnedBadge = {
	key: string;
	earnedAt: string | null;
};

export type CompletionStats = {
	totalChapters: number;
	completedChapters: number;
	/** 0-100, rounded to one decimal. */
	percent: number;

	otCompleted: number;
	ntCompleted: number;
	otChapters: number;
	ntChapters: number;

	booksCompleted: number;
	booksStarted: number;
	booksUntouched: number;

	/** Full passes through all 66 books. min(times) across the canon. */
	laps: number;
	/** Chapters already read again beyond the current completed lap. */
	chaptersTowardNextLap: number;

	byMode: Record<CompletionMode, ModeTotals>;
	books: BookProgress[];
	badges: EarnedBadge[];
	timeframe: TimeframeCounts;
	streak: StreakInfo;
};

/** The subset safe to render on a public profile — aggregates only, no dates or history. */
export type PublicCompletionStats = {
	username: string;
	name: string;
	profilePicture: string | null;
	completedChapters: number;
	totalChapters: number;
	percent: number;
	booksCompleted: number;
	laps: number;
	badges: EarnedBadge[];
	books: BookProgress[];
};

/** What the reader needs to show the chapter's completion state. */
export type ChapterCompletionStatus = {
	completedModes: CompletionMode[];
	times: number;
};
