"use server";

import { auth } from "@clerk/nextjs/server";
import { userGetByAuthIdSS } from "@/app/common/user/service/server/userGetByAuthIdSS";
import { bookGetAllByBibleIdSS } from "@/app/common/book/service/server/bookGetAllByBibleIdSS";
import { SessionStepCompletionRepository } from "@/app/common/sessionStepCompletion/repository/SessionStepCompletionRepository";
import { StudyMode } from "@/app/common/sessionStepCompletion/model/SessionStepCompletion";
import { formatStepReference, stepChapterCount } from "@/app/common/studyStep/model/reference";
import { bibleLabel } from "@/lib/bibleLabel";
import { SessionRepository } from "../repository/SessionRepository";
import { SessionFullWithBible } from "../model/Session";
import {
	SessionSummary,
	SessionSummaryStep,
	emptyModeTotals,
} from "../model/SessionSummary";

/**
 * A recap of what a study session actually covered.
 *
 * Ownership-checked and returns null on any miss, because the share-image route
 * calls this with a session id straight from a query string — a summary is a
 * record of someone's private study and must never be readable by id alone.
 *
 * Built from `session_step_completion` rows rather than the client's progress
 * state so the recap and its share image agree, and so reopening a finished
 * session shows the same thing it showed the first time.
 */
export async function sessionSummaryGetSS(sessionId: string): Promise<SessionSummary | null> {
	if (!sessionId) return null;

	const { userId: authId } = await auth();
	if (!authId) return null;

	let user;
	try {
		user = await userGetByAuthIdSS(authId);
	} catch {
		return null;
	}
	if (!user) return null;

	const session = (await new SessionRepository().getById(sessionId)) as SessionFullWithBible | null;
	if (!session || session.userId !== user.id) return null;

	const steps = session.study?.steps ?? [];
	const completions = await new SessionStepCompletionRepository().getBySessionId(sessionId);

	// Localized book names come from the study's own Bible — the same source the
	// reader used, so the recap names books the way the session did.
	let bookNames: Record<string, string> = {};
	const bible = session.study?.bible ?? null;
	if (bible?.id) {
		try {
			const books = await bookGetAllByBibleIdSS(bible.id);
			// apiId is the USFM code ("GEN"); `abbreviation` is the display form.
			bookNames = Object.fromEntries(books.map((b) => [b.apiId, b.name]));
		} catch {
			// Fall back to the raw USFM code.
		}
	}

	const byStep = new Map<string, typeof completions>();
	for (const c of completions) {
		const list = byStep.get(c.stepId) ?? [];
		list.push(c);
		byStep.set(c.stepId, list);
	}

	const modeTotals = emptyModeTotals();
	let totalSeconds = 0;
	let chaptersStudied = 0;
	let stepsCompleted = 0;

	const summarySteps: SessionSummaryStep[] = steps.map((step) => {
		const rows = byStep.get(step.id) ?? [];
		const modes: StudyMode[] = [];
		let seconds = 0;

		for (const row of rows) {
			const mode = row.mode as StudyMode;
			if (modeTotals[mode]) {
				if (!modes.includes(mode)) {
					modes.push(mode);
					modeTotals[mode].steps++;
				}
				modeTotals[mode].seconds += row.timeSpentSeconds ?? 0;
			}
			seconds += row.timeSpentSeconds ?? 0;
		}

		totalSeconds += seconds;
		const chapters = stepChapterCount(step);
		if (rows.length > 0) {
			stepsCompleted++;
			chaptersStudied += chapters;
		}

		const bookName = step.bookAbbreviation ? (bookNames[step.bookAbbreviation] ?? null) : null;
		return {
			stepId: step.id,
			stepNumber: step.stepNumber,
			title: step.title,
			reference: formatStepReference(step, bookName ?? undefined),
			bookAbbreviation: step.bookAbbreviation,
			bookName,
			chapters,
			modes,
			timeSpentSeconds: seconds,
		};
	});

	return {
		sessionId: session.id,
		studyId: session.studyId,
		studyName: session.study?.name ?? "",
		topic: session.study?.topic ?? null,
		bible: bible?.id ? { id: bible.id, slug: bible.slug, label: bibleLabel(bible) } : null,
		startedAt: session.startedAt?.toISOString() ?? null,
		completedAt: session.completedAt?.toISOString() ?? null,
		steps: summarySteps,
		stepsCompleted,
		totalSteps: steps.length,
		chaptersStudied,
		modeTotals,
		totalSeconds,
	};
}
