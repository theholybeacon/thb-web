"use server";

import { logger } from "@/app/utils/logger";
import { SessionStepCompletionRepository } from "../repository/SessionStepCompletionRepository";
import { SessionStepCompletion } from "../model/SessionStepCompletion";

const log = logger.child({ module: "sessionStepCompletionGetBySessionIdSS" });

export async function sessionStepCompletionGetBySessionIdSS(sessionId: string): Promise<SessionStepCompletion[]> {
	log.trace("sessionStepCompletionGetBySessionIdSS");

	const repository = new SessionStepCompletionRepository();
	return await repository.getBySessionId(sessionId);
}
