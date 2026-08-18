import { addDays } from "@/app/common/activity/model/streak";
import { NT_CHAPTERS, OT_CHAPTERS, TOTAL_CHAPTERS, TOTAL_BOOKS } from "@/app/common/canon/model/canon";
import {
	ALL_BIBLES_SCOPE,
	CompletionMode,
	CompletionStats,
	ModeTotals,
	TimeframeCounts,
} from "./Completion";
import { buildBookProgress } from "./stats";

/**
 * Calendar windows for the today/week/month/year counters.
 *
 * All arithmetic is on YYYY-MM-DD strings parsed as UTC (the same trick
 * `activity/model/streak.ts` uses), so a user's day boundaries come from the
 * local date we stored at write time rather than from server time — no timezone
 * drift, no DST edge cases.
 *
 * "This week" starts Monday; "this month" and "this year" are calendar to-date,
 * not rolling windows, because that is what the labels claim.
 */
export function timeframeStart(localDate: string, frame: keyof TimeframeCounts): string {
	const d = new Date(localDate + "T00:00:00Z");
	switch (frame) {
		case "today":
			return localDate;
		case "week": {
			// getUTCDay(): 0 = Sunday. Shift so Monday is the first day.
			const offset = (d.getUTCDay() + 6) % 7;
			return addDays(localDate, -offset);
		}
		case "month":
			return `${localDate.slice(0, 7)}-01`;
		case "year":
			return `${localDate.slice(0, 4)}-01-01`;
	}
}

/** Total completions in each window, from the per-date counts. */
export function sumTimeframes(
	countsByDate: Map<string, number>,
	localDate: string,
): TimeframeCounts {
	const result: TimeframeCounts = { today: 0, week: 0, month: 0, year: 0 };
	const bounds = {
		today: timeframeStart(localDate, "today"),
		week: timeframeStart(localDate, "week"),
		month: timeframeStart(localDate, "month"),
		year: timeframeStart(localDate, "year"),
	};

	for (const [date, count] of countsByDate) {
		// A date after today (clock skew, travel across the date line) is not
		// counted toward any window rather than silently inflating "today".
		if (date > localDate) continue;
		if (date >= bounds.today) result.today += count;
		if (date >= bounds.week) result.week += count;
		if (date >= bounds.month) result.month += count;
		if (date >= bounds.year) result.year += count;
	}
	return result;
}

/** The zero state, used for anonymous callers and as the query placeholder. */
export function emptyStats(): CompletionStats {
	const byMode = {} as Record<CompletionMode, ModeTotals>;
	for (const mode of ["read", "listen", "type", "manual"] as CompletionMode[]) {
		byMode[mode] = { chapters: 0, seconds: 0 };
	}
	return {
		totalChapters: TOTAL_CHAPTERS,
		completedChapters: 0,
		percent: 0,
		otCompleted: 0,
		ntCompleted: 0,
		otChapters: OT_CHAPTERS,
		ntChapters: NT_CHAPTERS,
		booksCompleted: 0,
		booksStarted: 0,
		booksUntouched: TOTAL_BOOKS,
		laps: 0,
		chaptersTowardNextLap: 0,
		byMode,
		books: buildBookProgress([]),
		badges: [],
		timeframe: { today: 0, week: 0, month: 0, year: 0 },
		streak: { current: 0, longest: 0, todayDone: false },
		scope: ALL_BIBLES_SCOPE,
		scopeAvailableChapters: null,
		scopeOptions: [],
	};
}
