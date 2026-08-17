import { ChapterCompletion } from "./Completion";

/**
 * How long after finishing a chapter it can count again as a *new* pass.
 *
 * Without this, leaving a chapter open and re-triggering the reader a few times
 * in an afternoon would claim several laps through the Bible. 20 hours (rather
 * than a flat 24) means a daily reader who reads a little earlier one morning
 * still gets credit, without the window ever covering two sittings in one day.
 */
export const RE_COMPLETION_COOLDOWN_HOURS = 20;

export type LapDecision =
	| { record: false }
	| { record: true; lap: number };

/**
 * Decide whether this completion is a new pass through the chapter.
 *
 * Pure so the rule is testable without a database, and so the cooldown lives in
 * exactly one place rather than being re-derived at each call site.
 */
export function decideLap(
	history: ChapterCompletion[],
	now: Date,
	cooldownHours: number = RE_COMPLETION_COOLDOWN_HOURS,
): LapDecision {
	if (history.length === 0) return { record: true, lap: 1 };

	let maxLap = 0;
	let mostRecent = 0;
	for (const row of history) {
		if (row.lap > maxLap) maxLap = row.lap;
		const at = row.completedAt instanceof Date ? row.completedAt.getTime() : new Date(row.completedAt).getTime();
		if (at > mostRecent) mostRecent = at;
	}

	const elapsedHours = (now.getTime() - mostRecent) / 3_600_000;
	if (elapsedHours < cooldownHours) return { record: false };

	return { record: true, lap: maxLap + 1 };
}
