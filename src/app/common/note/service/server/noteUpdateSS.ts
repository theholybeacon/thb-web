"use server";

import { logger } from "@/app/utils/logger";
import { requirePremiumUserSS } from "@/app/common/subscription/service/server/requirePremiumUserSS";
import { Note, NoteUpdateInput } from "../../model/Note";
import { NoteRepository } from "../../repository/NoteRepository";
import { NOTE_CONTENT_MAX_LENGTH, NOTE_TITLE_MAX_LENGTH } from "../../noteScope";

const log = logger.child({ module: 'noteUpdateSS' });

export async function noteUpdateSS(input: NoteUpdateInput): Promise<Note> {
	log.trace("noteUpdateSS");

	const user = await requirePremiumUserSS();

	const content = input.content?.trim();
	if (!content) throw new Error("Note content is required");
	if (content.length > NOTE_CONTENT_MAX_LENGTH) throw new Error("Note is too long");

	const noteRepository = new NoteRepository();

	// The ownerId is part of the update predicate, so a note belonging to
	// someone else simply matches nothing. The anchor is never rewritten.
	const updated = await noteRepository.update(input.id, user.id, {
		title: input.title?.trim().slice(0, NOTE_TITLE_MAX_LENGTH) || null,
		content,
	});
	if (!updated) throw new Error("Note not found");

	return updated;
}
