"use server";

import { requirePremiumUserSS } from "../../../subscription/service/server/requirePremiumUserSS";
import { resolveNoteTarget } from "../../../note/service/noteTargetResolver";
import { CommunityRepository } from "../../repository/CommunityRepository";
import { ContributionKind, ContributionTarget } from "../../model/Community";
import type { ContentRef } from "../../../entity/model/EntityContent";

const COOLDOWN_MS = 20_000;

export type ContributionCreateInput = {
	target: ContributionTarget;
	kind: ContributionKind;
	body: string;
	citations?: ContentRef[];
};

export async function contributionCreateSS(
	input: ContributionCreateInput,
): Promise<{ ok: boolean; error?: "premium" | "auth" | "empty" | "rate" | "target" }> {
	let user;
	try {
		user = await requirePremiumUserSS();
	} catch (e) {
		return { ok: false, error: e instanceof Error && e.message === "PREMIUM_REQUIRED" ? "premium" : "auth" };
	}

	const body = input.body?.trim();
	if (!body) return { ok: false, error: "empty" };

	const repo = new CommunityRepository();
	const last = await repo.getLastContributionAt(user.id);
	if (last && Date.now() - new Date(last).getTime() < COOLDOWN_MS) {
		return { ok: false, error: "rate" };
	}

	const common = { userId: user.id, kind: input.kind, body, citations: input.citations ?? [] };

	if (input.target.kind === "entity") {
		await repo.createContribution({
			...common,
			entityId: input.target.entityId,
			section: input.target.section,
		});
		return { ok: true };
	}

	// Resolve server-side so a client cannot anchor a thread to scripture that
	// does not exist, and so the stored abbreviation is the canonical uppercased
	// USFM id — the thing that makes the thread findable from any translation.
	const resolved = await resolveNoteTarget(input.target);
	if (!resolved) return { ok: false, error: "target" };

	await repo.createContribution({
		...common,
		targetType: input.target.targetType,
		bibleId: resolved.bibleId,
		bookAbbreviation: resolved.bookAbbreviation,
		chapter: resolved.chapter,
		verse: resolved.verse,
		reference: resolved.reference,
		bookName: resolved.bookName,
		bibleSlug: resolved.bibleSlug,
		bookSlug: resolved.bookSlug,
	});
	return { ok: true };
}
