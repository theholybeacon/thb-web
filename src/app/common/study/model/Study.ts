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
