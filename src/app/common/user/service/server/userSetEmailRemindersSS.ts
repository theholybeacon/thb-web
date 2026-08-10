"use server";

import { auth } from "@clerk/nextjs/server";
import { UserRepository } from "../../repository/UserRepository";
import { userGetByAuthIdSS } from "./userGetByAuthIdSS";

/** In-app toggle for daily reminder emails (the email footer link is the other way out). */
export async function userSetEmailRemindersSS(enabled: boolean): Promise<{ ok: boolean }> {
	const { userId: authId } = await auth();
	if (!authId) return { ok: false };

	let user;
	try {
		user = await userGetByAuthIdSS(authId);
	} catch {
		return { ok: false };
	}
	if (!user) return { ok: false };

	await new UserRepository().setEmailReminders(user.id, enabled);
	return { ok: true };
}
