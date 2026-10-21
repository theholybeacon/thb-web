"use server";

import { communityDataFor, resolveCallerUserId } from "../communityThreads";
import { CommunityData } from "../../model/Community";

/**
 * Public read of an entity's community layer: published contributions grouped
 * by AI section, each with its nested comment tree, authors, and (if signed in)
 * the caller's vote per target. Server-rendered on the character page.
 */
export async function communityListSS(entityId: string): Promise<CommunityData> {
	return await communityDataFor(entityId, await resolveCallerUserId());
}
