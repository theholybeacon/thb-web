import { auth } from "@clerk/nextjs/server";
import { userGetByAuthIdSS } from "../../user/service/server/userGetByAuthIdSS";
import { CommunityRepository } from "../repository/CommunityRepository";
import { Author, CommentNode, Contribution, ContributionFull } from "../model/Community";

/**
 * Shared by the entity and scripture community loaders. Not a `"use server"`
 * module — these are internal helpers, not server actions, and a `"use server"`
 * file may only export async functions.
 */

/**
 * The signed-in caller's internal user id, or null. Reading the community layer
 * is not an authenticated operation — the id is only used to resolve which way
 * the caller has already voted — so a failure here degrades to "no votes"
 * rather than throwing.
 */
export async function resolveCallerUserId(): Promise<string | null> {
	try {
		const { userId: authId } = await auth();
		if (!authId) return null;
		const user = await userGetByAuthIdSS(authId);
		return user?.id ?? null;
	} catch {
		return null;
	}
}

/**
 * Turns a flat list of contributions into full threads: each one's nested
 * comment tree (full depth), plus the caller's vote on every contribution and
 * comment. Input order is preserved.
 */
export async function hydrateContributions(
	repo: CommunityRepository,
	contributions: (Contribution & { author: Author })[],
	userId: string | null,
): Promise<ContributionFull[]> {
	if (contributions.length === 0) return [];

	const contributionIds = contributions.map((c) => c.id);
	const comments = await repo.listComments(contributionIds);
	const commentIds = comments.map((c) => c.id);

	const contribVotes = userId
		? await repo.getUserVotes(userId, "contribution", contributionIds)
		: new Map<string, number>();
	const commentVotes = userId
		? await repo.getUserVotes(userId, "comment", commentIds)
		: new Map<string, number>();

	// Build comment nodes and nest them by parent (full depth). parentCommentId
	// has no FK, so an orphan reply is promoted to a root rather than dropped.
	const nodeById = new Map<string, CommentNode>();
	for (const c of comments) {
		nodeById.set(c.id, { ...c, userVote: commentVotes.get(c.id) ?? 0, replies: [] });
	}
	const rootsByContribution = new Map<string, CommentNode[]>();
	for (const c of comments) {
		const node = nodeById.get(c.id)!;
		if (c.parentCommentId && nodeById.has(c.parentCommentId)) {
			nodeById.get(c.parentCommentId)!.replies.push(node);
		} else {
			const arr = rootsByContribution.get(c.contributionId) ?? [];
			arr.push(node);
			rootsByContribution.set(c.contributionId, arr);
		}
	}

	return contributions.map((contrib) => ({
		...contrib,
		userVote: contribVotes.get(contrib.id) ?? 0,
		comments: rootsByContribution.get(contrib.id) ?? [],
	}));
}
