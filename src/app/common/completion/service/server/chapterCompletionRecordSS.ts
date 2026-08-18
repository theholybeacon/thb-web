"use server";

import { auth } from "@clerk/nextjs/server";
import { userGetByAuthIdSS } from "@/app/common/user/service/server/userGetByAuthIdSS";
import { CompletionRepository } from "../../repository/CompletionRepository";
import {
	ChapterTally,
	ChapterTallyPair,
	CompletionMode,
	isCompletionMode,
} from "../../model/Completion";
import { decideLap } from "../../model/recording";
import { buildBookProgress, computeCoverage, splitTallies } from "../../model/stats";
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
	/** The pass just recorded THROUGH THIS TRANSLATION; 0 when nothing was written. */
	lap: number;
	/** Milestones newly reached across all translations. */
	newBadges: string[];
	/** Milestones newly reached within this translation alone. */
	newBibleBadges: string[];
};

const NOOP: ChapterCompletionRecordResult = { ok: false, lap: 0, newBadges: [], newBibleBadges: [] };

/**
 * Records that a chapter was completed, in whichever mode it was consumed.
 *
 * Auth only (not premium) — a sense of progress is for everyone, exactly like
 * the streak. No-ops for anonymous callers rather than throwing, because it is
 * called passively from the reader and must never surface an error there.
 *
 * Also marks the day active, so finishing a chapter feeds the existing streak
 * without the reader needing a second round trip.
 *
 * Progress is per-translation: the cooldown and the lap number are scoped to the
 * Bible the chapter was read in, so reading Genesis 1 in the KJV and then in
 * RVR60 records both. The "All Bibles" roll-up is derived on read (count(*)),
 * never stored, so the two zoom levels can never drift apart.
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
	const scopeBibleId = bibleId ?? null;

	// Only a genuinely new pass counts, and "the same pass" is now per-translation:
	// re-opening this chapter in THIS Bible within the cooldown must not inflate
	// the lap count, but opening it in a different one is real, separate reading.
	const history = await repo.getChapterHistoryInBible(
		user.id,
		bookAbbreviation,
		chapter,
		scopeBibleId,
	);
	const decision = decideLap(history, new Date());
	if (!decision.record) return { ok: true, lap: 0, newBadges: [], newBibleBadges: [] };

	const inserted = await repo.insert({
		userId: user.id,
		bookAbbreviation,
		chapter,
		mode,
		bibleId: scopeBibleId,
		lap: decision.lap,
		secondsSpent: secondsSpent != null && secondsSpent > 0 ? Math.round(secondsSpent) : null,
		completedDate: localDate,
	});
	// Lost the race with a concurrent write of the same lap — already recorded.
	if (!inserted) return { ok: true, lap: 0, newBadges: [], newBibleBadges: [] };

	// Reading is engagement: keep the streak in step without a second round trip.
	const activity = new ActivityRepository();
	await activity.upsert(user.id, localDate, mode === "listen" ? "listen" : "read");

	// Badges are pure predicates over the freshly-updated numbers; persisting them
	// is what gives us an earnedAt to celebrate and share at the right moment.
	//
	// Both zoom levels are awarded from ONE tally query: the write path runs on
	// every completion, so two round trips here would double the cost of the
	// hottest write in the app.
	let newBadges: string[] = [];
	let newBibleBadges: string[] = [];
	try {
		const [tallyRows, dates] = await Promise.all([
			scopeBibleId ? repo.getTallyPairs(user.id, scopeBibleId) : repo.getTallies(user.id),
			activity.getDates(user.id, addDays(localDate, -400)),
		]);
		const streak = computeStreak(dates, localDate);

		const { total, scoped } = scopeBibleId
			? splitTallies(tallyRows as ChapterTallyPair[])
			: { total: tallyRows as ChapterTally[], scoped: [] };

		const globalBooks = buildBookProgress(total);
		newBadges = await repo.awardBadges(
			user.id,
			earnedBadgeKeys(
				{ books: globalBooks, coverage: computeCoverage(globalBooks), streakLongest: streak.longest },
				"global",
			),
			null,
		);

		if (scopeBibleId) {
			const bibleBooks = buildBookProgress(scoped);
			newBibleBadges = await repo.awardBadges(
				user.id,
				// streakLongest is irrelevant at this zoom — the streak badges are
				// globalOnly and earnedBadgeKeys drops them before they can be written.
				earnedBadgeKeys(
					{ books: bibleBooks, coverage: computeCoverage(bibleBooks), streakLongest: 0 },
					"bible",
				),
				scopeBibleId,
			);
		}
	} catch {
		// A badge hiccup must never make a recorded chapter look like a failure.
	}

	return { ok: true, lap: decision.lap, newBadges, newBibleBadges };
}
