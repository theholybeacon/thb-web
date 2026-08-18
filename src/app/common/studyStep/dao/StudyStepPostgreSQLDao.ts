import { logger } from "@/app/utils/logger";
import { db } from "@/db";
import { StudyStep, StudyStepInsert } from "../model/StudyStep";
import { studyStepTable } from "@/db/schema/studyStep";

const log = logger.child({ module: 'StudyStepPostgreSQLDao' });
export class StudyStepPostgreSQLDao {

    async create(studyStep: StudyStepInsert): Promise<StudyStep> {
        log.trace("create");
        const returned = await db.insert(studyStepTable).values(studyStep).returning();
        return returned[0];
    }

    /**
     * Inserts a whole plan's steps in one statement.
     *
     * The per-step create() is fine for an AI study of a dozen steps, but the
     * chronological plan has 102 — and the Neon HTTP driver opens a connection
     * per statement, so a loop there is 102 round-trips on the request that a
     * reader is waiting on.
     */
    async createMany(steps: StudyStepInsert[]): Promise<StudyStep[]> {
        log.trace("createMany");
        if (!steps.length) return [];
        return await db.insert(studyStepTable).values(steps).returning();
    }

}

