"use server";

import { logger } from "@/app/utils/logger";
import { requirePremiumUserSS } from "@/app/common/subscription/service/server/requirePremiumUserSS";
import { Note } from "../../model/Note";
import { NoteRepository } from "../../repository/NoteRepository";
import { resolveCanonicalBook } from "../noteTargetResolver";

const log = logger.child({ module: 'noteGetForChapterSS' });

/**
 * Notes to surface while reading a chapter: the chapter's own notes, the notes
 * on its verses, and the book- and bible-level notes above it.
 *
 * The chapter is addressed canonically, so notes written in one translation show
 * up when the same passage is read in another. Returns an empty list instead of
 * throwing — the reader renders for anonymous and non-premium visitors too.
 */
export async function noteGetForChapterSS(
	bibleId: string,
	bookAbbreviation: string,
	chapter: number,
): Promise<Note[]> {
	log.trace("noteGetForChapterSS");

	try {
		const user = await requirePremiumUserSS();

		// Normalize through the same resolver the write path uses, so a caller that
		// addresses the book by slug or translation-specific abbreviation still
		// matches notes stored under the canonical apiId.
		const book = await resolveCanonicalBook(bibleId, bookAbbreviation);
		if (!book) return [];

		return await new NoteRepository().getByOwnerAndChapterContext(
			user.id,
			bibleId,
			book.apiId.toUpperCase(),
			chapter,
		);
	} catch {
		return [];
	}
}
