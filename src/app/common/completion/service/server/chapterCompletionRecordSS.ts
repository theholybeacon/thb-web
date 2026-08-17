"use server";

import { auth } from "@clerk/nextjs/server";
import { userGetByAuthIdSS } from "@/app/common/user/service/server/userGetByAuthIdSS";
import { CompletionRepository } from "../../repository/CompletionRepository";
import { CompletionMode, isCompletionMode } from "../../model/Completion";
import { decideLap } from "../../model/recording";
import { buildBookProgress, computeCoverage } from "../../model/stats";
import { earnedBadgeKeys } from "../../model/badges";
import { ActivityRepository } from "@/app/common/activity/repository/ActivityRepository";
import { addDays, computeStreak } from "@/app/common/activity/model/streak";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export type ChapterCompletionRecordInput = {
	bookAbbreviation: string;
	chapter: number;
	mode: CompletionMode;
	bibleId?: string | null;
	secondsSpent?: number | null;
	/** The client's local date (YYYY-MM-DD), same convention as the streak. */
	localDate: string;
};

export type ChapterCompletionRecordResult = {
	ok: boolean;
	/** The pass just recorded; 0 when nothing was written. */
	lap: number;
	newBadges: string[];
};

const NOOP: ChapterCompletionRecordResult = { ok: false, lap: 0, newBadges: [] };

/**
 * Records that a chapter was completed, in whichever mode it was consumed.
 *
 * Auth only (not premium) — a sense of progress is for everyone, exactly like
 * the streak. No-ops for anonymous callers rather than throwing, because it is
 * called passively from the reader and must never surface an error there.
 *
 * Also marks the day active, so finishing a chapter feeds the existing streak
 * without the reader needing a second round trip.
 */
export async function chapterCompletionRecordSS(
	input: ChapterCompletionRecordInput,
): Promise<ChapterCompletionRecordResult> {
	const { bookAbbreviation, chapter, mode, bibleId, secondsSpent, localDate } = input;

	if (!DATE_RE.test(localDate)) return NOOP;
	if (!isCompletionMode(mode)) return NOOP;
	if (!Number.isInteger(chapter) || chapter < 1) return NOOP;
	if (!bookAbbreviation) return NOOP;

	const { userId: authId } = await auth();
	if (!authId) return NOOP;

	let user;
	try {
		user = await userGetByAuthIdSS(authId);
	} catch {
		return NOOP;
	}
	if (!user) return NOOP;

	const repo = new CompletionRepository();

	// Only a genuinely new pass counts; re-opening the same chapter within the
	// cooldown must not inflate the lap count.
	const history = await repo.getChapterHistory(user.id, bookAbbreviation, chapter);
	const decision = decideLap(history, new Date());
	if (!decision.record) return { ok: true, lap: 0, newBadges: [] };

	const inserted = await repo.insert({
		userId: user.id,
		bookAbbreviation,
		chapter,
		mode,
		bibleId: bibleId ?? null,
		lap: decision.lap,
		secondsSpent: secondsSpent != null && secondsSpent > 0 ? Math.round(secondsSpent) : null,
		completedDate: localDate,
	});
	// Lost the race with a concurrent write of the same lap — already recorded.
	if (!inserted) return { ok: true, lap: 0, newBadges: [] };

	// Reading is engagement: keep the streak in step without a second round trip.
	const activity = new ActivityRepository();
	await activity.upsert(user.id, localDate, mode === "listen" ? "listen" : "read");

	// Badges are pure predicates over the freshly-updated numbers; persisting them
	// is what gives us an earnedAt to celebrate and share at the right moment.
	let newBadges: string[] = [];
	try {
		const [tallies, dates] = await Promise.all([
			repo.getTallies(user.id),
			activity.getDates(user.id, addDays(localDate, -400)),
		]);
		const books = buildBookProgress(tallies);
		const coverage = computeCoverage(books);
		const streak = computeStreak(dates, localDate);
		newBadges = await repo.awardBadges(
			user.id,
			earnedBadgeKeys({ books, coverage, streakLongest: streak.longest }),
		);
	} catch {
		// A badge hiccup must never make a recorded chapter look like a failure.
	}

	return { ok: true, lap: decision.lap, newBadges };
}
