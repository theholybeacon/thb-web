"use server";

import { logger } from "@/app/utils/logger";
import { requirePremiumUserSS } from "@/app/common/subscription/service/server/requirePremiumUserSS";
import { Note } from "../../model/Note";
import { NoteRepository } from "../../repository/NoteRepository";

const log = logger.child({ module: 'noteGetAllByOwnerSS' });

/**
 * Every note the signed-in user has written, newest edit first. Reads return an
 * empty list rather than throwing, so the surfaces that render for everyone stay
 * quiet for anonymous and non-premium visitors.
 */
export async function noteGetAllByOwnerSS(): Promise<Note[]> {
	log.trace("noteGetAllByOwnerSS");

	try {
		const user = await requirePremiumUserSS();
		return await new NoteRepository().getByOwnerId(user.id);
	} catch {
		return [];
	}
}
