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
 *
 * Badges exist at two zoom levels — earned across ALL translations, and earned
 * within one. `scope` marks the ones that only make sense globally: a streak is
 * a fact about days the user showed up, not about which translation they opened,
 * so "30-day streak in the KJV" would be meaningless.
 */

export type BadgeInput = {
	books: BookProgress[];
	coverage: CoverageTotals;
	streakLongest: number;
};

/**
 * "any" = earnable at either zoom level. "globalOnly" = never scoped to a single
 * translation, because the underlying measure is not translation-specific.
 */
export type BadgeScope = "any" | "globalOnly";

export type BadgeZoom = "global" | "bible";

export type BadgeDefinition = {
	key: string;
	/** Ordering in the UI: lower is earlier/easier. */
	tier: number;
	scope: BadgeScope;
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
	{ key: "firstChapter", tier: 1, scope: "any", earned: ({ coverage }) => coverage.completedChapters >= 1 },
	{ key: "firstBook", tier: 2, scope: "any", earned: ({ coverage }) => coverage.booksCompleted >= 1 },
	{ key: "tenPercent", tier: 3, scope: "any", earned: ({ coverage }) => coverage.percent >= 10 },
	{ key: "gospels", tier: 4, scope: "any", earned: ({ books }) => groupComplete(books, CANON_GROUP_USFMS.gospels) },
	{ key: "torah", tier: 5, scope: "any", earned: ({ books }) => groupComplete(books, CANON_GROUP_USFMS.torah) },
	{ key: "quarter", tier: 6, scope: "any", earned: ({ coverage }) => coverage.percent >= 25 },
	{ key: "week", tier: 7, scope: "globalOnly", earned: ({ streakLongest }) => streakLongest >= 7 },
	{ key: "half", tier: 8, scope: "any", earned: ({ coverage }) => coverage.percent >= 50 },
	{ key: "month", tier: 9, scope: "globalOnly", earned: ({ streakLongest }) => streakLongest >= 30 },
	{ key: "newTestament", tier: 10, scope: "any", earned: ({ books }) => testamentComplete(books, "NT") },
	{ key: "oldTestament", tier: 11, scope: "any", earned: ({ books }) => testamentComplete(books, "OT") },
	{ key: "firstLap", tier: 12, scope: "any", earned: ({ coverage }) => coverage.laps >= 1 },
	{ key: "year", tier: 13, scope: "globalOnly", earned: ({ streakLongest }) => streakLongest >= 365 },
	{ key: "thirdLap", tier: 14, scope: "any", earned: ({ coverage }) => coverage.laps >= 3 },
];

/**
 * Every badge key currently satisfied, in display order.
 *
 * At the "bible" zoom the globalOnly badges are excluded outright rather than
 * merely evaluating false, so they can never be written against a bibleId — a
 * scoped streak row would be a claim the data cannot support.
 */
export function earnedBadgeKeys(input: BadgeInput, zoom: BadgeZoom = "global"): string[] {
	return BADGES.filter((b) => (zoom === "global" || b.scope === "any") && b.earned(input)).map(
		(b) => b.key,
	);
}

/** The badges displayable at a zoom level, earned or not — drives the locked slots in the grid. */
export function badgesForZoom(zoom: BadgeZoom): BadgeDefinition[] {
	return zoom === "global" ? BADGES : BADGES.filter((b) => b.scope === "any");
}
