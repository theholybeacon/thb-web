"use server";

import { auth } from "@clerk/nextjs/server";
import { userGetByAuthIdSS } from "@/app/common/user/service/server/userGetByAuthIdSS";
import { SessionRepository } from "../repository/SessionRepository";
import { SessionSummary } from "../model/SessionSummary";
import { sessionSummaryGetSS } from "./sessionSummaryGetSS";

export type SessionFinishResult = {
	summary: SessionSummary | null;
	/** True only on the call that actually finished it — a reopened session returns false. */
	justFinished: boolean;
};

/**
 * Marks a study session finished and returns the recap.
 *
 * Until now a session had no finish state at all: the Finish button fired an
 * analytics event and navigated away, which left the sessions list showing a
 * completed study as "Continue" at 100% forever.
 *
 * Idempotent, so reopening a finished session and pressing Finish again returns
 * the same recap without moving the completion date.
 */
export async function sessionFinishSS(sessionId: string): Promise<SessionFinishResult> {
	if (!sessionId) return { summary: null, justFinished: false };

	const { userId: authId } = await auth();
	if (!authId) return { summary: null, justFinished: false };

	let user;
	try {
		user = await userGetByAuthIdSS(authId);
	} catch {
		return { summary: null, justFinished: false };
	}
	if (!user) return { summary: null, justFinished: false };

	const repo = new SessionRepository();
	const session = await repo.getById(sessionId);
	// Ownership is checked here as well as in sessionSummaryGetSS, because this
	// one writes.
	if (!session || session.userId !== user.id) return { summary: null, justFinished: false };

	const justFinished = await repo.markCompleted(sessionId);

	// Read back through the summary service so the recap is built from persisted
	// rows — the same source the share image will read a moment later.
	return { summary: await sessionSummaryGetSS(sessionId), justFinished };
}
