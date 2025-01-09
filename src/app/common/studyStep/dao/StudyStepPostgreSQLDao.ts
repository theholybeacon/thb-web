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

}

