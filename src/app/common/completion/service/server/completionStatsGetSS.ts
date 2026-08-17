"use server";

import { auth } from "@clerk/nextjs/server";
import { userGetByAuthIdSS } from "@/app/common/user/service/server/userGetByAuthIdSS";
import { bookGetAllByBibleIdSS } from "@/app/common/book/service/server/bookGetAllByBibleIdSS";
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
 */
export async function completionStatsGetSS(localDate: string): Promise<CompletionStats> {
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

	const [tallies, modeTotals, countsByDate, badgeRows, activityDates] = await Promise.all([
		repo.getTallies(user.id),
		repo.getModeTotals(user.id),
		repo.getCountsByDate(user.id, addDays(localDate, -370)),
		repo.getBadges(user.id),
		activity.getDates(user.id, addDays(localDate, -400)),
	]);

	let names: Record<string, string> = {};
	if (user.defaultBibleId) {
		try {
			const books = await bookGetAllByBibleIdSS(user.defaultBibleId);
			// Keyed on apiId, not `abbreviation`: apiId holds the USFM code ("GEN")
			// that the canon and the reader both use, while `abbreviation` is the
			// display form ("Gen") and would never match.
			names = Object.fromEntries(books.map((b) => [b.apiId, b.name]));
		} catch {
			// Fall back to the canon's English names.
		}
	}

	const books = buildBookProgress(tallies, names);
	const coverage = computeCoverage(books);
	const streak = computeStreak(activityDates, localDate);

	const byMode = {} as Record<CompletionMode, ModeTotals>;
	for (const mode of COMPLETION_MODES) {
		byMode[mode] = modeTotals[mode] ?? { chapters: 0, seconds: 0 };
	}

	const timeframe: TimeframeCounts = sumTimeframes(countsByDate, localDate);

	// Earned keys are recomputed from the live numbers so the list is never stale;
	// the stored rows only supply the date each was first reached.
	const earnedAtByKey = new Map(badgeRows.map((b) => [b.badgeKey, b.earnedAt]));
	const badges: EarnedBadge[] = earnedBadgeKeys({
		books,
		coverage,
		streakLongest: streak.longest,
	}).map((key) => ({
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
	};
}
