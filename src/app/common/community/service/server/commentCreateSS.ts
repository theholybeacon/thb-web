"use server";

import { requirePremiumUserSS } from "../../../subscription/service/server/requirePremiumUserSS";
import { CommunityRepository } from "../../repository/CommunityRepository";

export async function commentCreateSS(input: {
	contributionId: string;
	parentCommentId?: string | null;
	body: string;
}): Promise<{ ok: boolean; error?: "premium" | "auth" | "empty" }> {
	let user;
	try {
		user = await requirePremiumUserSS();
	} catch (e) {
		return { ok: false, error: e instanceof Error && e.message === "PREMIUM_REQUIRED" ? "premium" : "auth" };
	}

	const body = input.body?.trim();
	if (!body) return { ok: false, error: "empty" };

	await new CommunityRepository().createComment({
		contributionId: input.contributionId,
		parentCommentId: input.parentCommentId ?? null,
		userId: user.id,
		body,
	});
	return { ok: true };
}
