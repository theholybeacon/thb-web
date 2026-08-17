"use server";

import { auth } from "@clerk/nextjs/server";
import { userGetByAuthIdSS } from "@/app/common/user/service/server/userGetByAuthIdSS";
import { CompletionRepository } from "../../repository/CompletionRepository";
import { ChapterCompletionStatus, CompletionMode, isCompletionMode } from "../../model/Completion";

const EMPTY: ChapterCompletionStatus = { completedModes: [], times: 0 };

/**
 * Whether the signed-in user has finished this chapter, and how.
 *
 * Drives the reader's completion check — which doubles as the manual
 * "mark complete" control — so it answers the empty state for anonymous
 * visitors rather than throwing.
 */
export async function chapterCompletionStatusGetSS(
	bookAbbreviation: string,
	chapter: number,
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
	let times = 0;
	for (const row of history) {
		if (isCompletionMode(row.mode)) modes.add(row.mode);
		if (row.lap > times) times = row.lap;
	}

	return { completedModes: Array.from(modes), times };
}
