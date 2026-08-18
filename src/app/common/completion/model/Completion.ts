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
 * A user's passes through one chapter. `times` is how many times they have
 * completed it; 0 means untouched.
 *
 * Always derived from `count(*)`, never from `max(lap)` — `lap` is numbered per
 * translation and rows predating that are numbered globally, so the two disagree.
 */
export type ChapterTally = {
	bookAbbreviation: string;
	chapter: number;
	times: number;
};

/**
 * Both zoom levels for one chapter in a single row, so the record path can award
 * global and per-translation badges from one query instead of two.
 *
 * `total` counts every translation; `scoped` counts only the Bible asked about.
 */
export type ChapterTallyPair = {
	bookAbbreviation: string;
	chapter: number;
	total: number;
	scoped: number;
};

/** A translation the user has actually recorded progress in — one option in the switcher. */
export type JourneyScopeOption = {
	bibleId: string;
	slug: string;
	/** Display form, e.g. "KJV · Protestant". */
	label: string;
	/** Distinct canonical chapters completed in this translation. */
	chapters: number;
};

/** Which zoom level a payload was computed at. All-nulls means "All Bibles". */
export type JourneyScope = {
	bibleId: string | null;
	slug: string | null;
	label: string | null;
};

export const ALL_BIBLES_SCOPE: JourneyScope = { bibleId: null, slug: null, label: null };

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

	/** The zoom level these numbers were computed at. */
	scope: JourneyScope;
	/**
	 * Canonical chapters this translation actually carries, or null at the All
	 * Bibles level. Secondary and non-load-bearing: `percent` stays denominated on
	 * the full 1189 so it means the same thing for everyone, but a reduced-canon
	 * translation needs this to explain why it can never reach a full lap.
	 */
	scopeAvailableChapters: number | null;
	/** Translations the user has recorded anything in, for the switcher. */
	scopeOptions: JourneyScopeOption[];
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
	scope: JourneyScope;
	scopeOptions: JourneyScopeOption[];
};

/**
 * What the reader needs to show the chapter's completion state.
 *
 * Both zoom levels, because the reader is always inside one translation: `times`
 * answers "have I read this at all", `timesInThisBible` answers "have I read it
 * HERE" — and those diverge the moment someone switches translation.
 */
export type ChapterCompletionStatus = {
	completedModes: CompletionMode[];
	times: number;
	timesInThisBible: number;
	modesInThisBible: CompletionMode[];
};
