import { and, desc, eq, gte, max, sql } from "drizzle-orm";
import { db } from "@/db";
import { chapterCompletionTable } from "@/db/schema/chapterCompletion";
import { userBadgeTable } from "@/db/schema/userBadge";
import { logger } from "@/app/utils/logger";
import {
	ChapterCompletion,
	ChapterCompletionInsert,
	ChapterTally,
	ModeTotals,
	UserBadge,
} from "../model/Completion";

const log = logger.child({ module: "CompletionPostgreSQLDao" });

export class CompletionPostgreSQLDao {
	/**
	 * Times each chapter has been completed, one row per touched chapter.
	 *
	 * Bounded by the canon, so this is at most ~1189 rows no matter how long the
	 * user has been reading — small enough that the whole grid, the coverage
	 * counts and the laps math are derived from this single query in JS rather
	 * than from a denormalized summary table that could drift.
	 */
	async getTallies(userId: string): Promise<ChapterTally[]> {
		log.trace("getTallies");
		const rows = await db
			.select({
				bookAbbreviation: chapterCompletionTable.bookAbbreviation,
				chapter: chapterCompletionTable.chapter,
				times: max(chapterCompletionTable.lap),
			})
			.from(chapterCompletionTable)
			.where(eq(chapterCompletionTable.userId, userId))
			.groupBy(chapterCompletionTable.bookAbbreviation, chapterCompletionTable.chapter);

		return rows.map((r) => ({
			bookAbbreviation: r.bookAbbreviation,
			chapter: r.chapter,
			times: r.times ?? 0,
		}));
	}

	/** Distinct chapters and total engaged seconds per consumption mode. */
	async getModeTotals(userId: string): Promise<Record<string, ModeTotals>> {
		log.trace("getModeTotals");
		const rows = await db
			.select({
				mode: chapterCompletionTable.mode,
				chapters: sql<number>`count(distinct (${chapterCompletionTable.bookAbbreviation}, ${chapterCompletionTable.chapter}))`,
				seconds: sql<number>`coalesce(sum(${chapterCompletionTable.secondsSpent}), 0)`,
			})
			.from(chapterCompletionTable)
			.where(eq(chapterCompletionTable.userId, userId))
			.groupBy(chapterCompletionTable.mode);

		const totals: Record<string, ModeTotals> = {};
		for (const r of rows) {
			totals[r.mode] = { chapters: Number(r.chapters), seconds: Number(r.seconds) };
		}
		return totals;
	}

	/**
	 * Completion counts per local date since `sinceDate`. The caller slices this
	 * into today/week/month/year, which keeps the timeframe boundaries in one
	 * place (the service) instead of spread across four near-identical queries.
	 */
	async getCountsByDate(userId: string, sinceDate: string): Promise<Map<string, number>> {
		log.trace("getCountsByDate");
		const rows = await db
			.select({
				d: chapterCompletionTable.completedDate,
				count: sql<number>`count(*)`,
			})
			.from(chapterCompletionTable)
			.where(
				and(
					eq(chapterCompletionTable.userId, userId),
					gte(chapterCompletionTable.completedDate, sinceDate),
				),
			)
			.groupBy(chapterCompletionTable.completedDate);

		const counts = new Map<string, number>();
		for (const r of rows) counts.set(r.d, Number(r.count));
		return counts;
	}

	/** Every completion of one chapter, newest first — drives the cooldown and the next lap number. */
	async getChapterHistory(
		userId: string,
		bookAbbreviation: string,
		chapter: number,
	): Promise<ChapterCompletion[]> {
		log.trace("getChapterHistory");
		return await db
			.select()
			.from(chapterCompletionTable)
			.where(
				and(
					eq(chapterCompletionTable.userId, userId),
					eq(chapterCompletionTable.bookAbbreviation, bookAbbreviation),
					eq(chapterCompletionTable.chapter, chapter),
				),
			)
			.orderBy(desc(chapterCompletionTable.completedAt));
	}

	/**
	 * Records a completion. Returns null when the (user, chapter, lap) row already
	 * exists — the Neon HTTP driver has no interactive transactions, so the
	 * read-max-then-insert above this is a race; the unique constraint is what
	 * makes a double-submit a no-op instead of a phantom extra lap.
	 */
	async insert(row: ChapterCompletionInsert): Promise<ChapterCompletion | null> {
		log.trace("insert");
		const inserted = await db
			.insert(chapterCompletionTable)
			.values(row)
			.onConflictDoNothing()
			.returning();
		return inserted[0] ?? null;
	}

	async getBadges(userId: string): Promise<UserBadge[]> {
		log.trace("getBadges");
		return await db.select().from(userBadgeTable).where(eq(userBadgeTable.userId, userId));
	}

	/** Awards any badges not already held. Idempotent; returns the keys newly written. */
	async awardBadges(userId: string, badgeKeys: string[]): Promise<string[]> {
		log.trace("awardBadges");
		if (badgeKeys.length === 0) return [];
		const inserted = await db
			.insert(userBadgeTable)
			.values(badgeKeys.map((badgeKey) => ({ userId, badgeKey })))
			.onConflictDoNothing()
			.returning({ badgeKey: userBadgeTable.badgeKey });
		return inserted.map((r) => r.badgeKey);
	}
}
