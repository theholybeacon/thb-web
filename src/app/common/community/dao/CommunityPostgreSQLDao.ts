import { and, eq, inArray, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { contributionTable } from "@/db/schema/contribution";
import { communityCommentTable } from "@/db/schema/communityComment";
import { communityVoteTable } from "@/db/schema/communityVote";
import { communityFlagTable } from "@/db/schema/communityFlag";
import {
	Author,
	CommunityComment,
	CommunityCommentInsert,
	CommunityFlagInsert,
	Contribution,
	ContributionInsert,
	VoteTargetType,
} from "../model/Community";

const AUTHOR_COLUMNS = { id: true, name: true, username: true, profilePicture: true } as const;

export class CommunityPostgreSQLDao {
	async listContributions(entityId: string): Promise<(Contribution & { author: Author })[]> {
		return (await db.query.contributionTable.findMany({
			where: and(eq(contributionTable.entityId, entityId), eq(contributionTable.status, "published")),
			with: { author: { columns: AUTHOR_COLUMNS } },
			orderBy: (t, { desc, asc }) => [desc(t.score), asc(t.createdAt)],
		})) as (Contribution & { author: Author })[];
	}

	/**
	 * Every published scripture thread relevant while reading one chapter: the
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
				eq(contributionTable.status, "published"),
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

	async listComments(contributionIds: string[]): Promise<(CommunityComment & { author: Author })[]> {
		if (contributionIds.length === 0) return [];
		return (await db.query.communityCommentTable.findMany({
			where: and(
				inArray(communityCommentTable.contributionId, contributionIds),
				eq(communityCommentTable.status, "published"),
			),
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
		return rows[0];
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
