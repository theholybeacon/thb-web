
import { logger } from "@/app/utils/logger";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { studyTable } from "@/db/schema/study";
import { Study, StudyFull, StudyInsert } from "../model/Study";

const log = logger.child({ module: 'StudyPostgreSQLDao' });
export class StudyPostgreSQLDao {

    async create(study: StudyInsert): Promise<Study> {
        log.trace("create");
        const returned = await db.insert(studyTable).values(study).returning();
        return returned[0];
    }

    async getByOwnerId(ownerId: string): Promise<StudyFull[]> {
        log.trace("getByOwnerId");
        const returned = await db.query.studyTable.findMany({
            where: (eq(studyTable.ownerId, ownerId)),
            with: { steps: true }

        });
        console.log(returned);
        return returned as unknown as StudyFull[];
    }

}

