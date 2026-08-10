"use server";

import { auth } from "@clerk/nextjs/server";
import { UserRepository } from "../../repository/UserRepository";
import { userGetByAuthIdSS } from "./userGetByAuthIdSS";

/** Reject anything that isn't a real IANA zone before it reaches the DB. */
function isValidTimezone(tz: string): boolean {
	if (!tz || tz.length > 64) return false;
	try {
		new Intl.DateTimeFormat("en-CA", { timeZone: tz });
		return true;
	} catch {
		return false;
	}
}

/**
 * Store the browser's IANA timezone. The daily email cron needs it to work out
 * which calendar day (and, on Pro, which hour) each user is currently in.
 */
export async function userSetTimezoneSS(timezone: string): Promise<{ ok: boolean }> {
	if (!isValidTimezone(timezone)) return { ok: false };

	const { userId: authId } = await auth();
	if (!authId) return { ok: false };

	let user;
	try {
		user = await userGetByAuthIdSS(authId);
	} catch {
		return { ok: false };
	}
	if (!user) return { ok: false };

	await new UserRepository().setTimezone(user.id, timezone);
	return { ok: true };
}
