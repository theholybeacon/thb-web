"use server";

import { auth } from "@clerk/nextjs/server";
import { userGetByAuthIdSS } from "../../../user/service/server/userGetByAuthIdSS";
import { CommunityRepository } from "../../repository/CommunityRepository";
import {
	CommentNode,
	CommunityData,
	ContributionFull,
	ContributionSection,
	CONTRIBUTION_SECTIONS,
} from "../../model/Community";

/**
 * Public read of an entity's community layer: published contributions grouped
 * by AI section, each with its nested comment tree, authors, and (if signed in)
 * the caller's vote per target. Server-rendered on the character page.
 */
export async function communityListSS(entityId: string): Promise<CommunityData> {
	const repo = new CommunityRepository();
	const contributions = await repo.listContributions(entityId);
	const contributionIds = contributions.map((c) => c.id);
	const comments = await repo.listComments(contributionIds);

	let userId: string | null = null;
	try {
		const { userId: authId } = await auth();
		if (authId) {
			const u = await userGetByAuthIdSS(authId);
			userId = u?.id ?? null;
		}
	} catch {
		userId = null;
	}

	const commentIds = comments.map((c) => c.id);
	const contribVotes = userId
		? await repo.getUserVotes(userId, "contribution", contributionIds)
		: new Map<string, number>();
	const commentVotes = userId
		? await repo.getUserVotes(userId, "comment", commentIds)
		: new Map<string, number>();

	// Build comment nodes and nest them by parent (full depth).
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

	const data = CONTRIBUTION_SECTIONS.reduce((acc, s) => {
		acc[s] = [];
		return acc;
	}, {} as CommunityData);

	for (const contrib of contributions) {
		const full: ContributionFull = {
			...contrib,
			userVote: contribVotes.get(contrib.id) ?? 0,
			comments: rootsByContribution.get(contrib.id) ?? [],
		};
		data[contrib.section as ContributionSection].push(full);
	}

	return data;
}
