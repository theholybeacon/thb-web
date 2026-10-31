"use server";

import { auth } from "@clerk/nextjs/server";
import { UserRepository } from "../../repository/UserRepository";
import { parseReaderStart } from "../../model/ReaderStart";
import { userGetByAuthIdSS } from "./userGetByAuthIdSS";

/**
 * Saves the reader's answers from /welcome and marks them as through it.
 * `answers` null is "skip for now": through, with nothing to go on.
 */
export async function userSetReaderStartSS(answers: unknown | null): Promise<{ ok: boolean }> {
	const { userId: authId } = await auth();
	if (!authId) return { ok: false };

	let user;
	try {
		user = await userGetByAuthIdSS(authId);
	} catch {
		return { ok: false };
	}
	if (!user) return { ok: false };

	const start = answers === null ? null : parseReaderStart(answers);
	if (answers !== null && !start) return { ok: false };
	await new UserRepository().setReaderStart(user.id, start);
	return { ok: true };
}
