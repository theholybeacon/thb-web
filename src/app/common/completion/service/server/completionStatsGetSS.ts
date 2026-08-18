"use server";

import { auth } from "@clerk/nextjs/server";
import { userGetByAuthIdSS } from "@/app/common/user/service/server/userGetByAuthIdSS";
import { ActivityRepository } from "@/app/common/activity/repository/ActivityRepository";
import { addDays, computeStreak } from "@/app/common/activity/model/streak";
import { NT_CHAPTERS, OT_CHAPTERS, TOTAL_CHAPTERS } from "@/app/common/canon/model/canon";
import { CompletionRepository } from "../../repository/CompletionRepository";
import {
	COMPLETION_MODES,
	CompletionMode,
	CompletionStats,
	EarnedBadge,
	ModeTotals,
	TimeframeCounts,
} from "../../model/Completion";
import { buildBookProgress, computeCoverage } from "../../model/stats";
import { resolveScope } from "../../model/resolveScope";
import { earnedBadgeKeys } from "../../model/badges";
import { emptyStats, sumTimeframes } from "../../model/timeframe";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * The whole /journey payload in one call.
 *
 * Everything derives from ~1189 tally rows plus two tiny aggregates, so this
 * stays cheap without a denormalized summary table to keep in sync.
 *
 * Book names come from the user's own Bible when they have one — those are
 * already localized per translation, which is better than duplicating 66 names
 * per locale in the message files.
 *
 * `bibleSlug` picks the zoom level. Omitted, the numbers roll up every
 * translation ("All Bibles"); given, everything below — the grid, the coverage,
 * the laps, the per-mode habits and the badges — is recomputed for that Bible
 * alone. `percent` stays denominated on the full 1189-chapter canon either way,
 * so it means the same thing at both zoom levels and on anyone else's profile.
 */
export async function completionStatsGetSS(
	localDate: string,
	bibleSlug?: string | null,
): Promise<CompletionStats> {
	if (!DATE_RE.test(localDate)) return emptyStats();

	const { userId: authId } = await auth();
	if (!authId) return emptyStats();

	let user;
	try {
		user = await userGetByAuthIdSS(authId);
	} catch {
		return emptyStats();
	}
	if (!user) return emptyStats();

	const repo = new CompletionRepository();
	const activity = new ActivityRepository();

	// The scope has to resolve first: every aggregate below is filtered by it.
	const resolved = await resolveScope(bibleSlug, user.defaultBibleId);
	const scopeId = resolved.scope.bibleId ?? undefined;

	const [tallies, modeTotals, countsByDate, badgeRows, activityDates, scopeOptions] =
		await Promise.all([
			repo.getTallies(user.id, scopeId),
			repo.getModeTotals(user.id, scopeId),
			repo.getCountsByDate(user.id, addDays(localDate, -370), scopeId),
			repo.getBadges(user.id),
			activity.getDates(user.id, addDays(localDate, -400)),
			repo.getRecordedBibles(user.id),
		]);

	const books = buildBookProgress(tallies, resolved.names);
	const coverage = computeCoverage(books);
	const streak = computeStreak(activityDates, localDate);

	const byMode = {} as Record<CompletionMode, ModeTotals>;
	for (const mode of COMPLETION_MODES) {
		byMode[mode] = modeTotals[mode] ?? { chapters: 0, seconds: 0 };
	}

	const timeframe: TimeframeCounts = sumTimeframes(countsByDate, localDate);

	// Earned keys are recomputed from the live numbers so the list is never stale;
	// the stored rows only supply the date each was first reached — and only the
	// rows at THIS zoom level, so a global badge doesn't lend its date to the
	// scoped view (they were reached at different moments).
	const earnedAtByKey = new Map(
		badgeRows
			.filter((b) => (b.bibleId ?? null) === (resolved.scope.bibleId ?? null))
			.map((b) => [b.badgeKey, b.earnedAt]),
	);
	const badges: EarnedBadge[] = earnedBadgeKeys(
		{
			books,
			coverage,
			// A streak is a fact about days shown up, not about a translation, so at
			// the scoped zoom the streak badges are dropped rather than half-claimed.
			streakLongest: resolved.scope.bibleId ? 0 : streak.longest,
		},
		resolved.scope.bibleId ? "bible" : "global",
	).map((key) => ({
		key,
		earnedAt: earnedAtByKey.get(key)?.toISOString() ?? null,
	}));

	return {
		totalChapters: TOTAL_CHAPTERS,
		completedChapters: coverage.completedChapters,
		percent: coverage.percent,
		otCompleted: coverage.otCompleted,
		ntCompleted: coverage.ntCompleted,
		otChapters: OT_CHAPTERS,
		ntChapters: NT_CHAPTERS,
		booksCompleted: coverage.booksCompleted,
		booksStarted: coverage.booksStarted,
		booksUntouched: coverage.booksUntouched,
		laps: coverage.laps,
		chaptersTowardNextLap: coverage.chaptersTowardNextLap,
		byMode,
		books,
		badges,
		timeframe,
		streak,
		scope: resolved.scope,
		scopeAvailableChapters: resolved.availableChapters,
		scopeOptions,
	};
}
