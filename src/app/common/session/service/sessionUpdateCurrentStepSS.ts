'use server';

import { SessionRepository } from "../repository/SessionRepository";

export async function sessionUpdateCurrentStepSS(sessionId: string, stepId: string): Promise<void> {
    const repository = new SessionRepository();
    await repository.updateCurrentStep(sessionId, stepId);
}
