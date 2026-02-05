import { logger } from "@/app/utils/logger";
import { db } from "@/db";
import { Session, SessionFull, SessionInsert } from "../model/Session";
import { sessionTable } from "@/db/schema/session";
import { eq } from "drizzle-orm";

const log = logger.child({ module: 'SessionPostgreSQLDao' });

export class SessionPostgreSQLDao {

    async create(session: SessionInsert): Promise<Session> {
        log.trace("create");
        const returned = await db.insert(sessionTable).values(session).returning();
        return returned[0];
    }

    async getById(id: string): Promise<SessionFull | null> {
        log.trace("getById");

        const response = await db.query.sessionTable.findFirst({
            where: eq(sessionTable.id, id),
            with: {
                user: true,
                study: {
                    with: {
                        bible: true,
                        steps: {
                            orderBy: (steps, { asc }) => [asc(steps.stepNumber)],
                        }
                    }
                },
                currentStep: true,
            }
        });

        if (!response) {
            return null;
        }
        return response as unknown as SessionFull;
    }

    async getAllByOwnerId(id: string): Promise<SessionFull[]> {
        log.trace("getAllByOwnerId");

        const response = await db.query.sessionTable.findMany({
            where: eq(sessionTable.userId, id),
            with: {
                user: true,
                study: {
                    with: {
                        bible: true,
                        steps: {
                            orderBy: (steps, { asc }) => [asc(steps.stepNumber)],
                        }
                    }
                },
                currentStep: true,
            }
        });

        return response as unknown as SessionFull[];
    }

    async updateCurrentStep(sessionId: string, stepId: string): Promise<void> {
        log.trace("updateCurrentStep");
        await db.update(sessionTable).set({
            currentStepId: stepId,
            updatedAt: new Date(),
        }).where(eq(sessionTable.id, sessionId));
    }

    async updateProgress(
        sessionId: string,
        bookAbbreviation: string | null,
        chapter: number | null,
        verse: number | null
    ): Promise<void> {
        log.trace("updateProgress");
        await db.update(sessionTable).set({
            currentBookAbbreviation: bookAbbreviation,
            currentChapter: chapter,
            currentVerse: verse,
            updatedAt: new Date(),
        }).where(eq(sessionTable.id, sessionId));
    }

    async delete(id: string): Promise<void> {
        log.trace("delete");
        await db.delete(sessionTable).where(eq(sessionTable.id, id));
    }

    async deleteByStudyId(studyId: string): Promise<void> {
        log.trace("deleteByStudyId");
        await db.delete(sessionTable).where(eq(sessionTable.studyId, studyId));
    }
}
