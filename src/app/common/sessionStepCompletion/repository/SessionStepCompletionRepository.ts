import { logger } from "@/app/utils/logger";
import { SessionStepCompletionPostgreSQLDao } from "../dao/SessionStepCompletionPostgreSQLDao";
import { SessionStepCompletion, SessionStepCompletionInsert } from "../model/SessionStepCompletion";

const log = logger.child({ module: "SessionStepCompletionRepository" });

export class SessionStepCompletionRepository {
	private dao = new SessionStepCompletionPostgreSQLDao();

	async create(completion: SessionStepCompletionInsert): Promise<SessionStepCompletion> {
		log.trace("create");
		return await this.dao.create(completion);
	}

	async getBySessionId(sessionId: string): Promise<SessionStepCompletion[]> {
		log.trace("getBySessionId");
		return await this.dao.getBySessionId(sessionId);
	}

	async getBySessionIdAndStepId(sessionId: string, stepId: string): Promise<SessionStepCompletion[]> {
		log.trace("getBySessionIdAndStepId");
		return await this.dao.getBySessionIdAndStepId(sessionId, stepId);
	}

	async deleteBySessionId(sessionId: string): Promise<void> {
		log.trace("deleteBySessionId");
		return await this.dao.deleteBySessionId(sessionId);
	}
}
