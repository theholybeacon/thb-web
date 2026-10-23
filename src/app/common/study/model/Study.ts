import { studyTable } from "@/db/schema/study";
import { StudyStep, StudyStepInsert } from "../../studyStep/model/StudyStep";
import { Bible } from "../../bible/model/Bible";
import { StudyKind } from "./StudyKind";
import { StepKind } from "../../studyStep/model/StepContent";

export type StudyInsert = typeof studyTable.$inferInsert;

export type StudyInsertFull = StudyInsert & {
    steps: StudyStepInsert[]
}

export type Study = typeof studyTable.$inferSelect;

export type StudyFull = Study & {
    steps: StudyStep[]
}

/**
 * The person who designed a study, as much of them as is safe to show anyone:
 * never the whole user row (email, auth id). NULL is The Holy Beacon.
 */
export type StudyCreator = { id: string; name: string; username: string } | null;

export type StudyWithBible = Study & {
    bible: Bible | null;
}

export type StudyFullWithBible = Study & {
    steps: StudyStep[];
    bible: Bible | null;
    creator?: StudyCreator;
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
    kind: StudyKind;
    /** ISO 639-1. The Bible picker only offers translations in this language. */
    language: string;
    /** NULL is The Holy Beacon, which designs the whole catalog today. */
    creatorName: string | null;
    name: string;
    description: string;
    /** How many steps of each kind, e.g. { scripture: 4, text: 2, image: 2 }. */
    stepKinds: Partial<Record<StepKind, number>>;
    stepCount: number;
    /** Canonical chapters the plan covers. */
    chapterCount: number;
    /** Distinct books it touches. */
    bookCount: number;
    /** Set once the reader has taken this plan; `sessionId` is where to resume. */
    adopted: { studyId: string; sessionId: string | null } | null;
};
