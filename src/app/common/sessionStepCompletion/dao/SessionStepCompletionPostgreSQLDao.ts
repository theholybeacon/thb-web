import { db } from "@/db";
import { sessionStepCompletionTable } from "@/db/schema/sessionStepCompletion";
import { logger } from "@/app/utils/logger";
import { SessionStepCompletion, SessionStepCompletionInsert } from "../model/SessionStepCompletion";
import { and, eq } from "drizzle-orm";

const log = logger.child({ module: "SessionStepCompletionPostgreSQLDao" });

export class SessionStepCompletionPostgreSQLDao {
	async create(completion: SessionStepCompletionInsert): Promise<SessionStepCompletion> {
		log.trace("create");
		const result = await db.insert(sessionStepCompletionTable).values(completion).returning();
		return result[0];
	}

	async getBySessionId(sessionId: string): Promise<SessionStepCompletion[]> {
		log.trace("getBySessionId");
		return await db
			.select()
			.from(sessionStepCompletionTable)
			.where(eq(sessionStepCompletionTable.sessionId, sessionId));
	}

	async getBySessionIdAndStepId(sessionId: string, stepId: string): Promise<SessionStepCompletion[]> {
		log.trace("getBySessionIdAndStepId");
		return await db
			.select()
			.from(sessionStepCompletionTable)
			.where(
				and(
					eq(sessionStepCompletionTable.sessionId, sessionId),
					eq(sessionStepCompletionTable.stepId, stepId)
				)
			);
	}

	async deleteBySessionId(sessionId: string): Promise<void> {
		log.trace("deleteBySessionId");
		await db.delete(sessionStepCompletionTable).where(eq(sessionStepCompletionTable.sessionId, sessionId));
	}
}
