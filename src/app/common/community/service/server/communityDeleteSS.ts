"use server";

import { requirePremiumUserSS } from "../../../subscription/service/server/requirePremiumUserSS";
import { CommunityRepository } from "../../repository/CommunityRepository";
import { VoteTargetType } from "../../model/Community";

/**
 * Removes the caller's own contribution or comment.
 *
 * Soft-delete: the row stays as status 'removed'. If replies survive beneath it
 * the thread renders it as a tombstone; otherwise it vanishes from every list.
 *
 * The ownership check is the SQL predicate in the DAO, following noteDeleteSS —
 * a delete aimed at someone else's post changes nothing and still reports ok,
 * rather than confirming to the caller that the id exists.
 */
export async function communityDeleteSS(
	targetType: VoteTargetType,
	id: string,
): Promise<{ ok: boolean; error?: "premium" | "auth" }> {
	let user;
	try {
		user = await requirePremiumUserSS();
	} catch (e) {
		return { ok: false, error: e instanceof Error && e.message === "PREMIUM_REQUIRED" ? "premium" : "auth" };
	}

	await new CommunityRepository().remove(targetType, id, user.id);
	return { ok: true };
}
