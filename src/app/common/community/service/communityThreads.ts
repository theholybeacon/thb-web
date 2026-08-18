import { auth } from "@clerk/nextjs/server";
import { userGetByAuthIdSS } from "../../user/service/server/userGetByAuthIdSS";
import { CommunityRepository } from "../repository/CommunityRepository";
import { Author, CommentNode, Contribution, PostMeta } from "../model/Community";

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

/** Stands in for the author of a tombstoned post, so no name leaves the server. */
const DELETED_AUTHOR: Author = { id: "", name: "", username: "", profilePicture: null };

/**
 * Strips everything a deleted post used to say. The node is only still here to
 * hold its surviving replies in place, so the body, the author and the score go
 * — the client renders a "[deleted]" placeholder from `deleted` alone.
 */
function tombstone<T extends { body: string; userId: string; score: number }>(node: T) {
	return {
		...node,
		body: "",
		userId: "",
		score: 0,
		author: DELETED_AUTHOR,
		userVote: 0,
		isMine: false,
		deleted: true,
	};
}

/**
 * Turns a flat list of contributions into full threads: each one's nested
 * comment tree (full depth), plus the caller's vote on every contribution and
 * comment. Input order is preserved.
 *
 * The lists it is given include removed rows (see CommunityPostgreSQLDao), so
 * this is also where deletion is resolved: a removed post with no surviving
 * descendant is dropped, one with survivors is kept as a tombstone.
 *
 * Generic over the row so extra joined columns survive hydration with their
 * types intact — the global feed pulls `entity` alongside `author`. With
 * `T = Contribution & { author: Author }` the result is still assignable to
 * ContributionFull, so the entity and reader loaders are unaffected.
 */
export async function hydrateContributions<T extends Contribution & { author: Author }>(
	repo: CommunityRepository,
	contributions: T[],
	userId: string | null,
): Promise<(T & PostMeta & { comments: CommentNode[] })[]> {
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
		nodeById.set(c.id, {
			...c,
			userVote: commentVotes.get(c.id) ?? 0,
			isMine: userId != null && c.userId === userId,
			deleted: false,
			replies: [],
		});
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

	// Bottom-up, so a removed comment is only kept if something below it survived
	// the same test. Returning null means "gone" and the parent forgets it.
	const prune = (node: CommentNode): CommentNode | null => {
		const replies = node.replies.map(prune).filter((r): r is CommentNode => r !== null);
		if (node.status === "removed") {
			return replies.length === 0 ? null : { ...tombstone(node), replies };
		}
		return { ...node, replies };
	};

	const full: (T & PostMeta & { comments: CommentNode[] })[] = [];
	for (const contrib of contributions) {
		const comments = (rootsByContribution.get(contrib.id) ?? [])
			.map(prune)
			.filter((c): c is CommentNode => c !== null);

		if (contrib.status === "removed") {
			// citations too: nothing of a deleted post should reach the browser.
			if (comments.length > 0) full.push({ ...tombstone(contrib), citations: [], comments });
			continue;
		}
		full.push({
			...contrib,
			userVote: contribVotes.get(contrib.id) ?? 0,
			isMine: userId != null && contrib.userId === userId,
			deleted: false,
			comments,
		});
	}
	return full;
}
