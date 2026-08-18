import { studyTable } from "@/db/schema/study";
import { StudyStep, StudyStepInsert } from "../../studyStep/model/StudyStep";
import { Bible } from "../../bible/model/Bible";

export type StudyInsert = typeof studyTable.$inferInsert;

export type StudyInsertFull = StudyInsert & {
    steps: StudyStepInsert[]
}

export type Study = typeof studyTable.$inferSelect;

export type StudyFull = Study & {
    steps: StudyStep[]
}

export type StudyWithBible = Study & {
    bible: Bible | null;
}

export type StudyFullWithBible = Study & {
    steps: StudyStep[];
    bible: Bible | null;
}

/**
 * One card in the global catalog.
 *
 * Flattened on the server rather than shipping StudyFull to the client: the
 * chronological plan alone carries 102 steps with an explanation each, and the
 * catalog only needs to print two counts.
 */
export type GlobalStudyCard = {
    id: string;
    slug: string;
    name: string;
    description: string;
    stepCount: number;
    /** Canonical chapters the plan covers. */
    chapterCount: number;
    /** Distinct books it touches. */
    bookCount: number;
    /** Set once the reader has taken this plan; `sessionId` is where to resume. */
    adopted: { studyId: string; sessionId: string | null } | null;
};
