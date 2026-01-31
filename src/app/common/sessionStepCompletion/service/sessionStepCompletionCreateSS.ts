"use server";

import { logger } from "@/app/utils/logger";
import { SessionStepCompletionRepository } from "../repository/SessionStepCompletionRepository";
import { SessionStepCompletion, StudyMode } from "../model/SessionStepCompletion";

const log = logger.child({ module: "sessionStepCompletionCreateSS" });

export interface CreateStepCompletionParams {
	sessionId: string;
	stepId: string;
	mode: StudyMode;
	accuracy?: number;
	wpm?: number;
	timeSpentSeconds?: number;
}

export async function sessionStepCompletionCreateSS(params: CreateStepCompletionParams): Promise<SessionStepCompletion> {
	log.trace("sessionStepCompletionCreateSS");

	const repository = new SessionStepCompletionRepository();

	return await repository.create({
		sessionId: params.sessionId,
		stepId: params.stepId,
		mode: params.mode,
		accuracy: params.accuracy,
		wpm: params.wpm,
		timeSpentSeconds: params.timeSpentSeconds,
	});
}
