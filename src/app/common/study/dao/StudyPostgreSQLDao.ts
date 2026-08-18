import { logger } from "@/app/utils/logger";
import { and, asc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { studyTable } from "@/db/schema/study";
import { studyStepTable } from "@/db/schema/studyStep";
import { sessionTable } from "@/db/schema/session";
import { Study, StudyFull, StudyFullWithBible, StudyInsert } from "../model/Study";

const log = logger.child({ module: 'StudyPostgreSQLDao' });

export class StudyPostgreSQLDao {

    async create(study: StudyInsert): Promise<Study> {
        log.trace("create");
        const returned = await db.insert(studyTable).values(study).returning();
        return returned[0];
    }

    async getById(id: string): Promise<StudyFullWithBible | null> {
        log.trace("getById");
        const returned = await db.query.studyTable.findFirst({
            where: eq(studyTable.id, id),
            with: {
                bible: true,
                steps: {
                    orderBy: (steps, { asc }) => [asc(steps.stepNumber)],
                }
            }
        });
        return returned as StudyFullWithBible | null;
    }

    /** The catalog: every ready-made plan, in display order. */
    async getGlobals(): Promise<StudyFull[]> {
        log.trace("getGlobals");
        const returned = await db.query.studyTable.findMany({
            where: eq(studyTable.isGlobal, true),
            orderBy: [asc(studyTable.sortOrder), asc(studyTable.name)],
            with: {
                steps: {
                    orderBy: (steps, { asc: ascending }) => [ascending(steps.stepNumber)],
                }
            }
        });
        return returned as unknown as StudyFull[];
    }

    async getGlobalBySlug(slug: string): Promise<StudyFull | null> {
        log.trace("getGlobalBySlug");
        const returned = await db.query.studyTable.findFirst({
            where: and(eq(studyTable.slug, slug), eq(studyTable.isGlobal, true)),
            with: {
                steps: {
                    orderBy: (steps, { asc: ascending }) => [ascending(steps.stepNumber)],
                }
            }
        });
        return (returned ?? null) as StudyFull | null;
    }

    /**
     * The reader's copies of catalog plans, without their steps.
     *
     * Used to answer "have I already started this plan?" for the whole catalog
     * in one query, so the listing does not fan out into one lookup per card.
     */
    async getAdoptedByOwnerId(ownerId: string): Promise<Study[]> {
        log.trace("getAdoptedByOwnerId");
        return await db.select().from(studyTable).where(
            and(eq(studyTable.ownerId, ownerId), isNotNull(studyTable.sourceStudyId))
        );
    }

    async getByOwnerId(ownerId: string): Promise<StudyFullWithBible[]> {
        log.trace("getByOwnerId");
        const returned = await db.query.studyTable.findMany({
            where: (eq(studyTable.ownerId, ownerId)),
            with: {
                bible: true,
                steps: {
                    orderBy: (steps, { asc }) => [asc(steps.stepNumber)],
                }
            }
        });
        return returned as unknown as StudyFullWithBible[];
    }

    async update(id: string, data: Partial<Study>): Promise<Study> {
        log.trace("update");
        const returned = await db.update(studyTable)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(studyTable.id, id))
            .returning();
        return returned[0];
    }

    async delete(id: string): Promise<void> {
        log.trace("delete");
        await db.transaction(async (tx) => {
            // Delete all sessions associated with this study
            await tx.delete(sessionTable).where(eq(sessionTable.studyId, id));
            // Delete all steps associated with this study
            await tx.delete(studyStepTable).where(eq(studyStepTable.studyId, id));
            // Delete the study
            await tx.delete(studyTable).where(eq(studyTable.id, id));
        });
    }

    async deleteSteps(studyId: string): Promise<void> {
        log.trace("deleteSteps");
        await db.delete(studyStepTable).where(eq(studyStepTable.studyId, studyId));
    }
}
