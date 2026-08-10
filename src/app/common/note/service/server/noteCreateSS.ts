"use server";

import { logger } from "@/app/utils/logger";
import { requirePremiumUserSS } from "@/app/common/subscription/service/server/requirePremiumUserSS";
import { Note, NoteCreateInput } from "../../model/Note";
import { NoteRepository } from "../../repository/NoteRepository";
import { isNoteTargetType, NOTE_CONTENT_MAX_LENGTH, NOTE_TITLE_MAX_LENGTH } from "../../noteScope";
import { resolveNoteTarget } from "../noteTargetResolver";

const log = logger.child({ module: 'noteCreateSS' });

export async function noteCreateSS(input: NoteCreateInput): Promise<Note> {
	log.trace("noteCreateSS");

	// Throws UNAUTHENTICATED / PREMIUM_REQUIRED. This is the real gate — the
	// client-side PremiumGate and UpgradeModal are UX only.
	const user = await requirePremiumUserSS();

	const content = input.content?.trim();
	if (!content) throw new Error("Note content is required");
	if (content.length > NOTE_CONTENT_MAX_LENGTH) throw new Error("Note is too long");

	if (!isNoteTargetType(input.targetType)) throw new Error("Invalid note target");

	const target = await resolveNoteTarget(input);
	if (!target) throw new Error("Note target not found");

	const noteRepository = new NoteRepository();

	return await noteRepository.create({
		ownerId: user.id,
		targetType: input.targetType,
		bibleId: target.bibleId,
		bookAbbreviation: target.bookAbbreviation,
		chapter: target.chapter,
		verse: target.verse,
		reference: target.reference,
		bookName: target.bookName,
		bibleSlug: target.bibleSlug,
		bookSlug: target.bookSlug,
		title: input.title?.trim().slice(0, NOTE_TITLE_MAX_LENGTH) || null,
		content,
	});
}
