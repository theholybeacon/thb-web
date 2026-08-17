import { CANON_GROUP_USFMS } from "@/app/common/canon/model/canon";
import { BookProgress } from "./Completion";
import { CoverageTotals } from "./stats";

/**
 * Milestone definitions.
 *
 * The rules live here as pure predicates rather than in the database, so a badge
 * is always consistent with the numbers on screen and adding one never needs a
 * migration or a backfill. The `user_badge` table only records WHEN each first
 * became true — that timestamp is what lets us celebrate at the moment it is
 * earned, which is the moment someone actually wants to share.
 *
 * `key` is stored in user_badge.badgeKey and is also the i18n key
 * (`journey.badges.<key>`), so keys must be stable once shipped.
 */

export type BadgeInput = {
	books: BookProgress[];
	coverage: CoverageTotals;
	streakLongest: number;
};

export type BadgeDefinition = {
	key: string;
	/** Ordering in the UI: lower is earlier/easier. */
	tier: number;
	earned: (input: BadgeInput) => boolean;
};

/** True when every chapter of every named book has been completed at least once. */
function groupComplete(books: BookProgress[], usfms: string[]): boolean {
	const wanted = new Set(usfms);
	const relevant = books.filter((b) => wanted.has(b.usfm));
	// Defensive: an empty match must not read as "complete".
	if (relevant.length !== usfms.length) return false;
	return relevant.every((b) => b.completed === b.chapters);
}

function testamentComplete(books: BookProgress[], testament: "OT" | "NT"): boolean {
	const relevant = books.filter((b) => b.testament === testament);
	return relevant.length > 0 && relevant.every((b) => b.completed === b.chapters);
}

export const BADGES: BadgeDefinition[] = [
	{ key: "firstChapter", tier: 1, earned: ({ coverage }) => coverage.completedChapters >= 1 },
	{ key: "firstBook", tier: 2, earned: ({ coverage }) => coverage.booksCompleted >= 1 },
	{ key: "tenPercent", tier: 3, earned: ({ coverage }) => coverage.percent >= 10 },
	{ key: "gospels", tier: 4, earned: ({ books }) => groupComplete(books, CANON_GROUP_USFMS.gospels) },
	{ key: "torah", tier: 5, earned: ({ books }) => groupComplete(books, CANON_GROUP_USFMS.torah) },
	{ key: "quarter", tier: 6, earned: ({ coverage }) => coverage.percent >= 25 },
	{ key: "week", tier: 7, earned: ({ streakLongest }) => streakLongest >= 7 },
	{ key: "half", tier: 8, earned: ({ coverage }) => coverage.percent >= 50 },
	{ key: "month", tier: 9, earned: ({ streakLongest }) => streakLongest >= 30 },
	{ key: "newTestament", tier: 10, earned: ({ books }) => testamentComplete(books, "NT") },
	{ key: "oldTestament", tier: 11, earned: ({ books }) => testamentComplete(books, "OT") },
	{ key: "firstLap", tier: 12, earned: ({ coverage }) => coverage.laps >= 1 },
	{ key: "year", tier: 13, earned: ({ streakLongest }) => streakLongest >= 365 },
	{ key: "thirdLap", tier: 14, earned: ({ coverage }) => coverage.laps >= 3 },
];

/** Every badge key currently satisfied, in display order. */
export function earnedBadgeKeys(input: BadgeInput): string[] {
	return BADGES.filter((b) => b.earned(input)).map((b) => b.key);
}
