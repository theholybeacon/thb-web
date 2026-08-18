import { SQL, and, desc, eq, gte, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { chapterCompletionTable } from "@/db/schema/chapterCompletion";
import { bibleTable } from "@/db/schema/bible";
import { userBadgeTable } from "@/db/schema/userBadge";
import { logger } from "@/app/utils/logger";
import {
	ChapterCompletion,
	ChapterCompletionInsert,
	ChapterTally,
	ChapterTallyPair,
	JourneyScopeOption,
	ModeTotals,
	UserBadge,
} from "../model/Completion";
import { bibleLabel } from "@/lib/bibleLabel";

const log = logger.child({ module: "CompletionPostgreSQLDao" });

export class CompletionPostgreSQLDao {
	/**
	 * Narrow a query to one translation, or leave it across all of them.
	 *
	 * `undefined` means "every translation" and `null` means "the rows with no
	 * translation recorded" — two different questions, which is why the callers
	 * that need the second one go through explicitly named methods rather than
	 * relying on anyone remembering this distinction at the call site.
	 */
	private scopeFilter(bibleId: string | null | undefined): SQL | undefined {
		if (bibleId === undefined) return undefined;
		return bibleId === null
			? isNull(chapterCompletionTable.bibleId)
			: eq(chapterCompletionTable.bibleId, bibleId);
	}

	/**
	 * Times each chapter has been completed, one row per touched chapter.
	 *
	 * `bibleId` undefined rolls up every translation, a set value narrows to one.
	 * Counted with count(*), never max(lap) — see chapterCompletion's schema note.
	 *
	 * Bounded by the canon, so this is at most ~1189 rows no matter how long the
	 * user has been reading — small enough that the whole grid, the coverage
	 * counts and the laps math are derived from this single query in JS rather
	 * than from a denormalized summary table that could drift.
	 */
	async getTallies(userId: string, bibleId?: string | null): Promise<ChapterTally[]> {
		log.trace("getTallies");
		const rows = await db
			.select({
				bookAbbreviation: chapterCompletionTable.bookAbbreviation,
				chapter: chapterCompletionTable.chapter,
				times: sql<number>`count(*)`,
			})
			.from(chapterCompletionTable)
			.where(and(eq(chapterCompletionTable.userId, userId), this.scopeFilter(bibleId)))
			.groupBy(chapterCompletionTable.bookAbbreviation, chapterCompletionTable.chapter);

		return rows.map((r) => ({
			bookAbbreviation: r.bookAbbreviation,
			chapter: r.chapter,
			times: Number(r.times),
		}));
	}

	/**
	 * Both zoom levels for every touched chapter, in one round trip.
	 *
	 * The record path recomputes global AND per-translation badges on every single
	 * completion; doing that with two getTallies calls would double the cost of the
	 * hottest write in the app. The scoped /journey view reads the same query.
	 */
	async getTallyPairs(userId: string, bibleId: string): Promise<ChapterTallyPair[]> {
		log.trace("getTallyPairs");
		const rows = await db
			.select({
				bookAbbreviation: chapterCompletionTable.bookAbbreviation,
				chapter: chapterCompletionTable.chapter,
				total: sql<number>`count(*)`,
				scoped: sql<number>`count(*) filter (where ${chapterCompletionTable.bibleId} = ${bibleId})`,
			})
			.from(chapterCompletionTable)
			.where(eq(chapterCompletionTable.userId, userId))
			.groupBy(chapterCompletionTable.bookAbbreviation, chapterCompletionTable.chapter);

		return rows.map((r) => ({
			bookAbbreviation: r.bookAbbreviation,
			chapter: r.chapter,
			total: Number(r.total),
			scoped: Number(r.scoped),
		}));
	}

	/** Distinct chapters and total engaged seconds per consumption mode. */
	async getModeTotals(userId: string, bibleId?: string | null): Promise<Record<string, ModeTotals>> {
		log.trace("getModeTotals");
		const rows = await db
			.select({
				mode: chapterCompletionTable.mode,
				chapters: sql<number>`count(distinct (${chapterCompletionTable.bookAbbreviation}, ${chapterCompletionTable.chapter}))`,
				seconds: sql<number>`coalesce(sum(${chapterCompletionTable.secondsSpent}), 0)`,
			})
			.from(chapterCompletionTable)
			.where(and(eq(chapterCompletionTable.userId, userId), this.scopeFilter(bibleId)))
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
	async getCountsByDate(
		userId: string,
		sinceDate: string,
		bibleId?: string | null,
	): Promise<Map<string, number>> {
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
					this.scopeFilter(bibleId),
				),
			)
			.groupBy(chapterCompletionTable.completedDate);

		const counts = new Map<string, number>();
		for (const r of rows) counts.set(r.d, Number(r.count));
		return counts;
	}

	/** Every completion of one chapter across all translations, newest first — the reader's status. */
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
	 * The same history narrowed to one translation — drives the cooldown and the
	 * next lap number, both of which are now per-translation.
	 *
	 * Separate from getChapterHistory rather than an optional argument: "all
	 * translations" and "the rows with no translation" are different questions and
	 * a single `bibleId?: string | null` parameter makes them one typo apart.
	 */
	async getChapterHistoryInBible(
		userId: string,
		bookAbbreviation: string,
		chapter: number,
		bibleId: string | null,
	): Promise<ChapterCompletion[]> {
		log.trace("getChapterHistoryInBible");
		return await db
			.select()
			.from(chapterCompletionTable)
			.where(
				and(
					eq(chapterCompletionTable.userId, userId),
					eq(chapterCompletionTable.bookAbbreviation, bookAbbreviation),
					eq(chapterCompletionTable.chapter, chapter),
					this.scopeFilter(bibleId),
				),
			)
			.orderBy(desc(chapterCompletionTable.completedAt));
	}

	/**
	 * The translations this user has actually recorded anything in — the options
	 * in the zoom switcher.
	 *
	 * Only translations with real progress, so the picker stays a handful of rows
	 * rather than the ~400-Bible catalogue. Unattributed rows (bibleId null) are
	 * excluded by the join and belong to the All Bibles level only.
	 */
	async getRecordedBibles(userId: string): Promise<JourneyScopeOption[]> {
		log.trace("getRecordedBibles");
		const rows = await db
			.select({
				bibleId: bibleTable.id,
				slug: bibleTable.slug,
				name: bibleTable.name,
				version: bibleTable.version,
				description: bibleTable.description,
				chapters: sql<number>`count(distinct (${chapterCompletionTable.bookAbbreviation}, ${chapterCompletionTable.chapter}))`,
			})
			.from(chapterCompletionTable)
			.innerJoin(bibleTable, eq(chapterCompletionTable.bibleId, bibleTable.id))
			.where(eq(chapterCompletionTable.userId, userId))
			.groupBy(bibleTable.id, bibleTable.slug, bibleTable.name, bibleTable.version, bibleTable.description)
			.orderBy(desc(sql`count(*)`));

		return rows.map((r) => ({
			bibleId: r.bibleId,
			slug: r.slug,
			label: bibleLabel(r),
			chapters: Number(r.chapters),
		}));
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

	/**
	 * Awards any badges not already held at this zoom level. Idempotent; returns
	 * the keys newly written.
	 *
	 * `bibleId` null writes the global badge, a set value the translation-scoped
	 * one. The unique constraint is NULLS NOT DISTINCT, so the global row stays
	 * single instead of being re-inserted on every completion.
	 */
	async awardBadges(
		userId: string,
		badgeKeys: string[],
		bibleId: string | null,
	): Promise<string[]> {
		log.trace("awardBadges");
		if (badgeKeys.length === 0) return [];
		const inserted = await db
			.insert(userBadgeTable)
			.values(badgeKeys.map((badgeKey) => ({ userId, badgeKey, bibleId })))
			.onConflictDoNothing()
			.returning({ badgeKey: userBadgeTable.badgeKey });
		return inserted.map((r) => r.badgeKey);
	}
}
