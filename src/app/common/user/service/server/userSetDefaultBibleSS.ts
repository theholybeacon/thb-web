"use server";

import { auth } from "@clerk/nextjs/server";
import { logger } from "@/app/utils/logger";
import { UserRepository } from "../../repository/UserRepository";

const log = logger.child({ module: "userSetDefaultBibleSS" });

/**
 * Remembers the translation the reader chose.
 *
 * `user.defaultBibleId` has always existed and has five readers — the daily
 * home widget, the daily email sweep and both completion services — but nothing
 * ever wrote it, so it was permanently NULL and all five silently fell back to
 * "whichever English row the database returned first". Writing it here makes
 * those correct without touching them.
 *
 * Never throws: remembering a preference is not worth failing a page over.
 */
export async function userSetDefaultBibleSS(bibleId: string): Promise<void> {
	if (!bibleId) return;
	try {
		const { userId: authId } = await auth();
		if (!authId) return;

		const repo = new UserRepository();
		const user = await repo.getByAuthId(authId);
		if (!user || user.defaultBibleId === bibleId) return;

		await repo.setDefaultBible(user.id, bibleId);
	} catch (err) {
		log.warn({ err: err instanceof Error ? err.message : String(err) }, "could not store default bible");
	}
}
