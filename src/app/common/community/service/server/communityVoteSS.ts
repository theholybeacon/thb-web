"use server";

import { requirePremiumUserSS } from "../../../subscription/service/server/requirePremiumUserSS";
import { CommunityRepository } from "../../repository/CommunityRepository";
import { VoteTargetType } from "../../model/Community";

/** Set the caller's vote (+1, -1, or 0 to clear) on a contribution/comment. */
export async function communityVoteSS(
	targetType: VoteTargetType,
	targetId: string,
	value: number,
): Promise<{ ok: boolean; score?: number; userVote?: number; error?: "premium" | "auth" }> {
	let user;
	try {
		user = await requirePremiumUserSS();
	} catch (e) {
		return { ok: false, error: e instanceof Error && e.message === "PREMIUM_REQUIRED" ? "premium" : "auth" };
	}

	const normalized = value > 0 ? 1 : value < 0 ? -1 : 0;
	const score = await new CommunityRepository().setVote(targetType, targetId, user.id, normalized);
	return { ok: true, score, userVote: normalized };
}
