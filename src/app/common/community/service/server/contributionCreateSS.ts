"use server";

import { requirePremiumUserSS } from "../../../subscription/service/server/requirePremiumUserSS";
import { CommunityRepository } from "../../repository/CommunityRepository";
import { ContributionSection } from "../../model/Community";
import type { ContentRef } from "../../../entity/model/EntityContent";

const COOLDOWN_MS = 20_000;

export type ContributionCreateInput = {
	entityId: string;
	section: ContributionSection;
	kind: "fact" | "analysis" | "correction";
	body: string;
	citations?: ContentRef[];
};

export async function contributionCreateSS(
	input: ContributionCreateInput,
): Promise<{ ok: boolean; error?: "premium" | "auth" | "empty" | "rate" }> {
	let user;
	try {
		user = await requirePremiumUserSS();
	} catch (e) {
		return { ok: false, error: e instanceof Error && e.message === "PREMIUM_REQUIRED" ? "premium" : "auth" };
	}

	const body = input.body?.trim();
	if (!body) return { ok: false, error: "empty" };

	const last = await new CommunityRepository().getLastContributionAt(user.id);
	if (last && Date.now() - new Date(last).getTime() < COOLDOWN_MS) {
		return { ok: false, error: "rate" };
	}

	await new CommunityRepository().createContribution({
		entityId: input.entityId,
		section: input.section,
		userId: user.id,
		kind: input.kind,
		body,
		citations: input.citations ?? [],
	});
	return { ok: true };
}
