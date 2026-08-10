"use server";

import { logger } from "@/app/utils/logger";
import { requirePremiumUserSS } from "@/app/common/subscription/service/server/requirePremiumUserSS";
import { NoteRepository } from "../../repository/NoteRepository";

const log = logger.child({ module: 'noteDeleteSS' });

export async function noteDeleteSS(id: string): Promise<void> {
	log.trace("noteDeleteSS");

	const user = await requirePremiumUserSS();

	const noteRepository = new NoteRepository();

	// Scoped to the owner, so this is a no-op on someone else's note.
	await noteRepository.delete(id, user.id);
}
