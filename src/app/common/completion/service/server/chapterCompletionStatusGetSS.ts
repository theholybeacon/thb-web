"use server";

import { auth } from "@clerk/nextjs/server";
import { userGetByAuthIdSS } from "@/app/common/user/service/server/userGetByAuthIdSS";
import { CompletionRepository } from "../../repository/CompletionRepository";
import { ChapterCompletionStatus, CompletionMode, isCompletionMode } from "../../model/Completion";

const EMPTY: ChapterCompletionStatus = {
	completedModes: [],
	times: 0,
	timesInThisBible: 0,
	modesInThisBible: [],
};

/**
 * Whether the signed-in user has finished this chapter, and how.
 *
 * Drives the reader's completion check — which doubles as the manual
 * "mark complete" control — so it answers the empty state for anonymous
 * visitors rather than throwing.
 *
 * Answers both zoom levels in one query, because the reader is always inside one
 * translation: `times` is "have I read this at all", `timesInThisBible` is "have
 * I read it here". The manual-mark control keys off the scoped answer, so
 * switching translation correctly offers the chapter again.
 */
export async function chapterCompletionStatusGetSS(
	bookAbbreviation: string,
	chapter: number,
	bibleId?: string | null,
): Promise<ChapterCompletionStatus> {
	if (!bookAbbreviation || !Number.isInteger(chapter) || chapter < 1) return EMPTY;

	const { userId: authId } = await auth();
	if (!authId) return EMPTY;

	let user;
	try {
		user = await userGetByAuthIdSS(authId);
	} catch {
		return EMPTY;
	}
	if (!user) return EMPTY;

	const history = await new CompletionRepository().getChapterHistory(
		user.id,
		bookAbbreviation,
		chapter,
	);
	if (history.length === 0) return EMPTY;

	const modes = new Set<CompletionMode>();
	const modesInThisBible = new Set<CompletionMode>();
	let timesInThisBible = 0;

	for (const row of history) {
		const mode = isCompletionMode(row.mode) ? row.mode : null;
		if (mode) modes.add(mode);
		if (bibleId && row.bibleId === bibleId) {
			timesInThisBible++;
			if (mode) modesInThisBible.add(mode);
		}
	}

	// count(*), not max(lap): laps are numbered per translation now, and rows
	// written before that are numbered globally, so lap is not a count of anything
	// meaningful on the read path.
	return {
		completedModes: Array.from(modes),
		times: history.length,
		timesInThisBible,
		modesInThisBible: Array.from(modesInThisBible),
	};
}
