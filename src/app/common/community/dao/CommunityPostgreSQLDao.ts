import { SQL, and, asc, desc, eq, inArray, isNotNull, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { contributionTable } from "@/db/schema/contribution";
import { communityCommentTable } from "@/db/schema/communityComment";
import { communityVoteTable } from "@/db/schema/communityVote";
import { communityFlagTable } from "@/db/schema/communityFlag";
import { bibleTable } from "@/db/schema/bible";
import { bookTable } from "@/db/schema/book";
import { userTable } from "@/db/schema/user";
import type { RefLinkMap } from "@/components/entity/CitationLinks";
import {
	Author,
	CommunityComment,
	CommunityCommentInsert,
	CommunityFlagInsert,
	Contribution,
	ContributionInsert,
	VoteTargetType,
} from "../model/Community";
import type {
	CommunityFeedFacets,
	CommunityFeedFilters,
	CommunityFeedRow,
	CommunityFeedSort,
} from "../model/CommunityFeed";

const AUTHOR_COLUMNS = { id: true, name: true, username: true, profilePicture: true } as const;

/**
 * Removed rows are deliberately NOT filtered out here, with one documented
 * exception (listFeed). A comment whose author deleted it may still have live
 * replies underneath, and dropping it in SQL would orphan them —
 * hydrateContributions needs the whole tree to decide what becomes a tombstone
 * and what disappears.
 */
export class CommunityPostgreSQLDao {
	async listContributions(entityId: string): Promise<(Contribution & { author: Author })[]> {
		return (await db.query.contributionTable.findMany({
			where: eq(contributionTable.entityId, entityId),
			with: { author: { columns: AUTHOR_COLUMNS } },
			orderBy: (t, { desc, asc }) => [desc(t.score), asc(t.createdAt)],
		})) as (Contribution & { author: Author })[];
	}

	/**
	 * Every scripture thread relevant while reading one chapter: the
	 * chapter's own and its verses' (both matched canonically, so they follow the
	 * reader across translations), the book-level ones above them, and the
	 * bible-level ones — those last matched on bibleId, since a thread about a
	 * translation only belongs to that translation.
	 *
	 * Mirrors NotePostgreSQLDao.getByOwnerAndChapterContext, minus the owner
	 * filter. Limited because a chapter like John 3 can accumulate far more
	 * threads than a character page ever will.
	 */
	async listScriptureContributions(
		bibleId: string,
		bookAbbreviation: string,
		chapter: number,
		limit = 30,
	): Promise<(Contribution & { author: Author })[]> {
		return (await db.query.contributionTable.findMany({
			where: and(
				isNull(contributionTable.entityId),
				or(
					and(
						eq(contributionTable.bookAbbreviation, bookAbbreviation),
						eq(contributionTable.chapter, chapter),
					),
					and(
						eq(contributionTable.targetType, "book"),
						eq(contributionTable.bookAbbreviation, bookAbbreviation),
					),
					and(eq(contributionTable.targetType, "bible"), eq(contributionTable.bibleId, bibleId)),
				),
			),
			with: { author: { columns: AUTHOR_COLUMNS } },
			orderBy: (t, { desc, asc }) => [desc(t.score), asc(t.createdAt)],
			limit,
		})) as (Contribution & { author: Author })[];
	}

	/**
	 * A page of the global /comments feed.
	 *
	 * Unlike every other list here, this one DOES filter status='published' in
	 * SQL. A tombstone exists to hold a thread together *in context* — under a
	 * verse, under a character section. A global feed has no context to hold, a
	 * "[deleted]" card between unrelated posts is noise, and offset pagination
	 * needs `total` to match what actually renders. Nested comment tombstoning is
	 * untouched: listComments still returns removed comments and
	 * hydrateContributions still prunes them.
	 *
	 * Ordering by reply volume or recency reads the denormalized commentCount and
	 * lastActivityAt columns rather than aggregating community_comment per
	 * request. An aggregate cannot be index-ordered, so `ORDER BY max(...) LIMIT
	 * 20` would scan every published contribution on every page load. Both are
	 * maintained by recomputeThreadStats, exactly as `score` is by recomputeScore.
	 *
	 * Anchor filters are exact, not hierarchical — see CommunityFeedFilters.
	 * A scripture filter implicitly excludes entity rows anyway, since
	 * contribution_anchor_check guarantees their scripture columns are all null.
	 */
	async listFeed(
		opts: CommunityFeedFilters & { sort: CommunityFeedSort; limit: number; offset: number },
	): Promise<{ rows: CommunityFeedRow[]; total: number }> {
		const t = contributionTable;

		const filters: SQL[] = [eq(t.status, "published")];
		if (opts.source === "scripture") filters.push(isNull(t.entityId));
		if (opts.source === "entity") filters.push(isNotNull(t.entityId));
		if (opts.bibleId) filters.push(eq(t.bibleId, opts.bibleId));
		if (opts.bookAbbreviation) filters.push(eq(t.bookAbbreviation, opts.bookAbbreviation.toUpperCase()));
		if (opts.chapter != null) filters.push(eq(t.chapter, opts.chapter));
		if (opts.verse != null) filters.push(eq(t.verse, opts.verse));
		if (opts.kind) filters.push(eq(t.kind, opts.kind));
		if (opts.authorUserId) filters.push(eq(t.userId, opts.authorUserId));
		const where = and(...filters);

		// Every order ends in `id`. score and commentCount are overwhelmingly 0 and
		// timestamps tie on bulk writes; an unstable sort under OFFSET silently
		// duplicates rows onto one page and skips them on the next.
		const ORDER: Record<CommunityFeedSort, SQL[]> = {
			activity: [desc(t.lastActivityAt), desc(t.createdAt), desc(t.id)],
			newest: [desc(t.createdAt), desc(t.id)],
			oldest: [asc(t.createdAt), asc(t.id)],
			score: [desc(t.score), desc(t.createdAt), desc(t.id)],
			comments: [desc(t.commentCount), desc(t.createdAt), desc(t.id)],
		};

		const rows = (await db.query.contributionTable.findMany({
			where,
			with: {
				author: { columns: AUTHOR_COLUMNS },
				// Entity-anchored rows have no reader URL; the feed links them to
				// /bible/people/[slug] instead, which resolves by slug.
				entity: { columns: { slug: true, name: true } },
			},
			orderBy: ORDER[opts.sort],
			limit: opts.limit,
			offset: opts.offset,
		})) as CommunityFeedRow[];

		// Same `where` reused for the count, as in EntityPostgreSQLDao.listForIndex.
		const totalRows = await db.select({ n: sql<number>`count(*)::int` }).from(t).where(where);
		return { rows, total: totalRows[0]?.n ?? 0 };
	}

	/**
	 * The options the feed's filter bar may offer, derived from rows that
	 * actually have contributions rather than from the catalogue. There is no
	 * point offering forty translations when three have ever been written in, and
	 * a dropdown entry that leads to an empty feed is worse than a missing one.
	 */
	async listFeedFacets(): Promise<CommunityFeedFacets> {
		const t = contributionTable;
		const published = eq(t.status, "published");

		const [bibles, books, kinds, authors, sources] = await Promise.all([
			db
				.select({
					bibleId: t.bibleId,
					name: bibleTable.name,
					version: bibleTable.version,
					count: sql<number>`count(*)::int`,
				})
				.from(t)
				.innerJoin(bibleTable, eq(bibleTable.id, t.bibleId))
				.where(published)
				.groupBy(t.bibleId, bibleTable.name, bibleTable.version)
				.orderBy(sql`count(*) DESC`),

			// bookName is already denormalized on the row, so no join is needed to
			// name a book. `book` is joined only for bookOrder — a book picker has to
			// read Genesis -> Revelation, not by popularity. The join is against the
			// row's own translation, which is the copy it was written from.
			// upper(apiId) is not indexable, but `book` is ~66 rows per translation.
			db
				.select({
					bookAbbreviation: t.bookAbbreviation,
					bookName: sql<string>`min(${t.bookName})`,
					count: sql<number>`count(*)::int`,
				})
				.from(t)
				.leftJoin(
					bookTable,
					and(eq(bookTable.bibleId, t.bibleId), sql`upper(${bookTable.apiId}) = ${t.bookAbbreviation}`),
				)
				.where(and(published, isNotNull(t.bookAbbreviation)))
				.groupBy(t.bookAbbreviation)
				.orderBy(sql`min(coalesce(${bookTable.bookOrder}, 999))`),

			db
				.select({ kind: t.kind, count: sql<number>`count(*)::int` })
				.from(t)
				.where(published)
				.groupBy(t.kind)
				.orderBy(sql`count(*) DESC`),

			// Capped at 50. An author filter cannot be an unbounded list of every
			// user who ever posted, and a username search box would need a lookup
			// round trip per keystroke. Top contributors plus the "Mine only" toggle
			// covers the two cases people actually want — a user outside the top 50
			// is simply not reachable from the dropdown, which is intended.
			db
				.select({
					userId: t.userId,
					name: userTable.name,
					username: userTable.username,
					count: sql<number>`count(*)::int`,
				})
				.from(t)
				.innerJoin(userTable, eq(userTable.id, t.userId))
				.where(published)
				.groupBy(t.userId, userTable.name, userTable.username)
				.orderBy(sql`count(*) DESC`)
				.limit(50),

			db
				.select({
					scripture: sql<number>`count(*) filter (where ${t.entityId} is null)::int`,
					entity: sql<number>`count(*) filter (where ${t.entityId} is not null)::int`,
				})
				.from(t)
				.where(published),
		]);

		return {
			bibles: bibles.map((b) => ({ ...b, bibleId: b.bibleId as string })),
			books: books.map((b) => ({ ...b, bookAbbreviation: b.bookAbbreviation as string })),
			kinds,
			authors,
			sources: sources[0] ?? { scripture: 0, entity: 0 },
		};
	}

	/**
	 * Citation link parts for a set of translations, as
	 * bibleId -> (uppercased USFM abbreviation -> reader link parts).
	 *
	 * Keyed by translation on purpose: the same abbreviation resolves to a
	 * different bookSlug in each one, so a single flat map would link a citation
	 * into the wrong translation's URL.
	 */
	async listCitationLinkMaps(bibleIds: string[]): Promise<Record<string, RefLinkMap>> {
		if (bibleIds.length === 0) return {};
		const rows = await db
			.select({
				bibleId: bookTable.bibleId,
				apiId: bookTable.apiId,
				bookSlug: bookTable.slug,
				bibleSlug: bibleTable.slug,
			})
			.from(bookTable)
			.innerJoin(bibleTable, eq(bibleTable.id, bookTable.bibleId))
			.where(inArray(bookTable.bibleId, bibleIds));

		const result: Record<string, RefLinkMap> = {};
		for (const r of rows) {
			const map = (result[r.bibleId] ??= {});
			map[r.apiId.toUpperCase()] = { bibleSlug: r.bibleSlug, bookSlug: r.bookSlug };
		}
		return result;
	}

	async listComments(contributionIds: string[]): Promise<(CommunityComment & { author: Author })[]> {
		if (contributionIds.length === 0) return [];
		return (await db.query.communityCommentTable.findMany({
			where: inArray(communityCommentTable.contributionId, contributionIds),
			with: { author: { columns: AUTHOR_COLUMNS } },
			orderBy: (t, { asc }) => [asc(t.createdAt)],
		})) as (CommunityComment & { author: Author })[];
	}

	/** The caller's votes on a set of targets, as targetId -> value. */
	async getUserVotes(
		userId: string,
		targetType: VoteTargetType,
		targetIds: string[],
	): Promise<Map<string, number>> {
		const map = new Map<string, number>();
		if (targetIds.length === 0) return map;
		const rows = await db
			.select({ targetId: communityVoteTable.targetId, value: communityVoteTable.value })
			.from(communityVoteTable)
			.where(
				and(
					eq(communityVoteTable.userId, userId),
					eq(communityVoteTable.targetType, targetType),
					inArray(communityVoteTable.targetId, targetIds),
				),
			);
		for (const r of rows) map.set(r.targetId, r.value);
		return map;
	}

	async createContribution(input: ContributionInsert): Promise<Contribution> {
		const rows = await db.insert(contributionTable).values(input).returning();
		return rows[0];
	}

	async createComment(input: CommunityCommentInsert): Promise<CommunityComment> {
		const rows = await db.insert(communityCommentTable).values(input).returning();
		await this.recomputeThreadStats(rows[0].contributionId);
		return rows[0];
	}

	/**
	 * Recomputes the two denormalized reply stats the feed sorts on, mirroring
	 * recomputeScore: recount rather than increment, so a dropped write self-heals
	 * on the next comment instead of drifting forever.
	 *
	 * Removed comments count toward neither. Deleting a reply must not leave a
	 * thread inflated in "most replied" nor pinned to the top of "recent
	 * activity", or deletion becomes a way to hold position. A thread whose only
	 * reply is a tombstone kept alive by a surviving grandchild undercounts by
	 * one; the grandchild is published and still counted, so the thread keeps a
	 * non-zero count and a correct timestamp.
	 *
	 * The contribution's own updatedAt is deliberately left alone — a reply is not
	 * an edit of the post it hangs under.
	 */
	private async recomputeThreadStats(contributionId: string): Promise<void> {
		const rows = await db
			.select({
				n: sql<number>`count(*)::int`,
				last: sql<Date | null>`max(${communityCommentTable.createdAt})`,
			})
			.from(communityCommentTable)
			.where(
				and(
					eq(communityCommentTable.contributionId, contributionId),
					eq(communityCommentTable.status, "published"),
				),
			);

		await db
			.update(contributionTable)
			.set({
				commentCount: Number(rows[0]?.n ?? 0),
				// Coalesced in SQL against the row's own createdAt, so a thread with no
				// live replies sorts by its age and the column stays NOT NULL without a
				// second read.
				lastActivityAt: sql`coalesce(${rows[0]?.last ?? null}::timestamp, ${contributionTable.createdAt})`,
			})
			.where(eq(contributionTable.id, contributionId));
	}

	/**
	 * Soft-delete: the row survives as status 'removed' so replies hanging off it
	 * keep their parent. hydrateContributions decides whether it is shown as a
	 * tombstone or dropped.
	 *
	 * The owner is part of the predicate, as on note delete — deleting someone
	 * else's post is a silent no-op rather than an error to distinguish.
	 */
	async remove(targetType: VoteTargetType, id: string, userId: string): Promise<void> {
		if (targetType === "contribution") {
			await db
				.update(contributionTable)
				.set({ status: "removed", updatedAt: new Date() })
				.where(and(eq(contributionTable.id, id), eq(contributionTable.userId, userId)));
		} else {
			const rows = await db
				.update(communityCommentTable)
				.set({ status: "removed", updatedAt: new Date() })
				.where(and(eq(communityCommentTable.id, id), eq(communityCommentTable.userId, userId)))
				.returning({ contributionId: communityCommentTable.contributionId });
			// Empty when the row belonged to someone else — the ownership predicate
			// made the update a no-op, so there is nothing to recount.
			if (rows[0]) await this.recomputeThreadStats(rows[0].contributionId);
		}
	}

	/** Set/clear a user's vote (value 0 removes it), then recompute the target's score. */
	async setVote(
		targetType: VoteTargetType,
		targetId: string,
		userId: string,
		value: number,
	): Promise<number> {
		if (value === 0) {
			await db
				.delete(communityVoteTable)
				.where(
					and(
						eq(communityVoteTable.targetType, targetType),
						eq(communityVoteTable.targetId, targetId),
						eq(communityVoteTable.userId, userId),
					),
				);
		} else {
			await db
				.insert(communityVoteTable)
				.values({ targetType, targetId, userId, value })
				.onConflictDoUpdate({
					target: [communityVoteTable.targetType, communityVoteTable.targetId, communityVoteTable.userId],
					set: { value, updatedAt: new Date() },
				});
		}
		return this.recomputeScore(targetType, targetId);
	}

	private async recomputeScore(targetType: VoteTargetType, targetId: string): Promise<number> {
		const rows = await db
			.select({ total: sql<number>`COALESCE(SUM(${communityVoteTable.value}), 0)` })
			.from(communityVoteTable)
			.where(and(eq(communityVoteTable.targetType, targetType), eq(communityVoteTable.targetId, targetId)));
		const score = Number(rows[0]?.total ?? 0);
		if (targetType === "contribution") {
			await db.update(contributionTable).set({ score, updatedAt: new Date() }).where(eq(contributionTable.id, targetId));
		} else {
			await db.update(communityCommentTable).set({ score, updatedAt: new Date() }).where(eq(communityCommentTable.id, targetId));
		}
		return score;
	}

	async createFlag(input: CommunityFlagInsert): Promise<void> {
		await db.insert(communityFlagTable).values(input);
	}

	/** Most recent contribution timestamp by a user, for rate-limiting. */
	async getLastContributionAt(userId: string): Promise<Date | null> {
		const rows = await db
			.select({ createdAt: contributionTable.createdAt })
			.from(contributionTable)
			.where(eq(contributionTable.userId, userId))
			.orderBy(sql`${contributionTable.createdAt} DESC`)
			.limit(1);
		return rows[0]?.createdAt ?? null;
	}
}
