"use server";

import { auth } from "@clerk/nextjs/server";
import { userGetByAuthIdSS } from "../../../user/service/server/userGetByAuthIdSS";
import { ActivityRepository } from "../../repository/ActivityRepository";
import { StreakInfo } from "../../model/Activity";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Add `delta` days to a YYYY-MM-DD string via UTC parsing (DST-safe, TZ-free). */
function addDays(date: string, delta: number): string {
	const d = new Date(date + "T00:00:00Z");
	d.setUTCDate(d.getUTCDate() + delta);
	return d.toISOString().slice(0, 10);
}

/**
 * Current + longest daily streak relative to the client's local date. The
 * current streak has a grace day: it survives on yesterday's activity until the
 * end of today (so a user doesn't "lose" it mid-day before engaging).
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
	const set = new Set(dates);

	const todayDone = set.has(localDate);

	// Current streak: start today (or yesterday, grace) and walk backward.
	let current = 0;
	let cursor = todayDone ? localDate : addDays(localDate, -1);
	while (set.has(cursor)) {
		current++;
		cursor = addDays(cursor, -1);
	}

	// Longest run (dates sort chronologically as YYYY-MM-DD strings).
	const sorted = Array.from(set).sort();
	let longest = 0;
	let run = 0;
	let prev: string | null = null;
	for (const d of sorted) {
		run = prev && addDays(prev, 1) === d ? run + 1 : 1;
		if (run > longest) longest = run;
		prev = d;
	}

	return { current, longest, todayDone };
}
