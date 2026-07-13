"use server";

import { requirePremiumUserSS } from "../../../subscription/service/server/requirePremiumUserSS";
import { CommunityRepository } from "../../repository/CommunityRepository";
import { VoteTargetType } from "../../model/Community";

export async function communityFlagSS(
	targetType: VoteTargetType,
	targetId: string,
	reason?: string,
): Promise<{ ok: boolean; error?: "premium" | "auth" }> {
	let user;
	try {
		user = await requirePremiumUserSS();
	} catch (e) {
		return { ok: false, error: e instanceof Error && e.message === "PREMIUM_REQUIRED" ? "premium" : "auth" };
	}

	await new CommunityRepository().createFlag({
		targetType,
		targetId,
		userId: user.id,
		reason: reason ?? null,
	});
	return { ok: true };
}
