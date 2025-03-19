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


    async getById(id: string): Promise<SessionFull> {
        log.trace("getById");

        const response = await db.query.sessionTable.findFirst({
            where: eq(sessionTable.id, id),
            with: {
                user: true,
                study: {
                    with: {
                        steps: true
                    }
                },
                currentBook: true,
                currentChapter: true,
                currentVerse: true,
                currentStep: true,
            }
        });

        if (!response) {
            throw ("Session not found");

        }
        return response;

    }

    async getAllByOwnerId(id: string): Promise<SessionFull[]> {
        log.trace("getAllByOwnerId");

        const response = await db.query.sessionTable.findMany({
            where: eq(sessionTable.id, id),
            with: {
                user: true,
                study: {
                    with: {
                        steps: true
                    }
                },
                currentBook: true,
                currentChapter: true,
                currentVerse: true,
                currentStep: true,
            }
        });

        if (!response) {
            throw ("Session not found");

        }
        return response;
    }
}

