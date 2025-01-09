
import { logger } from "@/app/utils/logger";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { studyTable } from "@/db/schema/study";
import { Study, StudyInsert } from "../model/Study";
import { userTable } from "@/db/schema/user";

const log = logger.child({ module: 'StudyPostgreSQLDao' });
export class StudyPostgreSQLDao {

    async create(study: StudyInsert): Promise<Study> {
        log.trace("create");
        const returned = await db.insert(studyTable).values(study).returning();
        return returned[0];
    }

    async getByOwnerId(ownerId: string): Promise<Study[]> {
        log.trace("getByOwnerId");
        const returned = await db.query.studyTable.findMany({
            where: (eq(studyTable.ownerId, ownerId)),
        });
        return returned;
    }

}

