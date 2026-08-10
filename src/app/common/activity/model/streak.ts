import { StreakInfo } from "./Activity";

/** Add `delta` days to a YYYY-MM-DD string via UTC parsing (DST-safe, TZ-free). */
export function addDays(date: string, delta: number): string {
	const d = new Date(date + "T00:00:00Z");
	d.setUTCDate(d.getUTCDate() + delta);
	return d.toISOString().slice(0, 10);
}

/**
 * Current + longest daily streak relative to `localDate`. Pure — no I/O — so it
 * is shared by the per-user `streakGetSS` and the bulk daily email sweep.
 *
 * The current streak has a grace day: it survives on yesterday's activity until
 * the end of today, so a user doesn't "lose" it mid-day before engaging. That
 * also makes `current >= N` on a day with no activity mean exactly "this streak
 * dies tonight" — which is what the streak-at-risk email keys off.
 */
export function computeStreak(dates: string[], localDate: string): StreakInfo {
	const set = new Set(dates);
	const todayDone = set.has(localDate);

	let current = 0;
	let cursor = todayDone ? localDate : addDays(localDate, -1);
	while (set.has(cursor)) {
		current++;
		cursor = addDays(cursor, -1);
	}

	// Longest run (dates sort chronologically as YYYY-MM-DD strings).
	const sorted = Array.from(set).sort();
	let longest = 0;
	let run = 0;
	let prev: string | null = null;
	for (const d of sorted) {
		run = prev && addDays(prev, 1) === d ? run + 1 : 1;
		if (run > longest) longest = run;
		prev = d;
	}

	return { current, longest, todayDone };
}
