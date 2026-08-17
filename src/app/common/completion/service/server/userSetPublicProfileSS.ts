"use server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userTable } from "@/db/schema/user";
import { userGetByAuthIdSS } from "@/app/common/user/service/server/userGetByAuthIdSS";

/**
 * Turns the public /u/[username] journey page on or off.
 *
 * Separate from userUpdateProfileSS on purpose: this is a visibility decision,
 * not a profile field, and it should never be flipped as a side effect of saving
 * an unrelated form.
 */
export async function userSetPublicProfileSS(enabled: boolean): Promise<{ ok: boolean }> {
	const { userId: authId } = await auth();
	if (!authId) return { ok: false };

	let user;
	try {
		user = await userGetByAuthIdSS(authId);
	} catch {
		return { ok: false };
	}
	if (!user) return { ok: false };

	await db
		.update(userTable)
		.set({ publicProfileEnabled: enabled })
		.where(eq(userTable.id, user.id));

	return { ok: true };
}
