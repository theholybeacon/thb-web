"use server";

import { auth } from "@clerk/nextjs/server";
import { userGetByAuthIdSS } from "../../../user/service/server/userGetByAuthIdSS";
import { ActivityRepository } from "../../repository/ActivityRepository";
import { StreakInfo } from "../../model/Activity";
import { addDays, computeStreak } from "../../model/streak";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Current + longest daily streak relative to the client's local date.
 * The streak math itself lives in `model/streak.ts` so the daily email sweep
 * can reuse it without duplicating the grace-day rule.
 */
export async function streakGetSS(localDate: string): Promise<StreakInfo> {
	const empty: StreakInfo = { current: 0, longest: 0, todayDone: false };
	if (!DATE_RE.test(localDate)) return empty;

	const { userId: authId } = await auth();
	if (!authId) return empty;

	let user;
	try {
		user = await userGetByAuthIdSS(authId);
	} catch {
		return empty;
	}
	if (!user) return empty;

	const since = addDays(localDate, -400);
	const dates = await new ActivityRepository().getDates(user.id, since);

	return computeStreak(dates, localDate);
}
