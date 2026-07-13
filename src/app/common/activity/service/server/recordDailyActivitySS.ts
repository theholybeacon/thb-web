"use server";

import { auth } from "@clerk/nextjs/server";
import { userGetByAuthIdSS } from "../../../user/service/server/userGetByAuthIdSS";
import { ActivityRepository } from "../../repository/ActivityRepository";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Marks today (the client's local date) active for the signed-in user. Auth
 * only (not premium) — streaks are for everyone. No-ops for anonymous callers.
 */
export async function recordDailyActivitySS(
	localDate: string,
	source?: string,
): Promise<{ ok: boolean }> {
	if (!DATE_RE.test(localDate)) return { ok: false };

	const { userId: authId } = await auth();
	if (!authId) return { ok: false };

	let user;
	try {
		user = await userGetByAuthIdSS(authId);
	} catch {
		return { ok: false };
	}
	if (!user) return { ok: false };

	await new ActivityRepository().upsert(user.id, localDate, source ?? null);
	return { ok: true };
}
