"use server";

import { CommunityRepository } from "../../repository/CommunityRepository";
import { hydrateContributions, resolveCallerUserId } from "../communityThreads";
import { CommunityData, ContributionSection, CONTRIBUTION_SECTIONS } from "../../model/Community";

/**
 * Public read of an entity's community layer: published contributions grouped
 * by AI section, each with its nested comment tree, authors, and (if signed in)
 * the caller's vote per target. Server-rendered on the character page.
 */
export async function communityListSS(entityId: string): Promise<CommunityData> {
	const repo = new CommunityRepository();
	const contributions = await repo.listContributions(entityId);
	const userId = await resolveCallerUserId();
	const full = await hydrateContributions(repo, contributions, userId);

	const data = CONTRIBUTION_SECTIONS.reduce((acc, s) => {
		acc[s] = [];
		return acc;
	}, {} as CommunityData);

	for (const contrib of full) {
		// `section` is nullable now that scripture threads share this table, but a
		// contribution reached through an entityId always has one.
		if (!contrib.section) continue;
		data[contrib.section as ContributionSection].push(contrib);
	}

	return data;
}
