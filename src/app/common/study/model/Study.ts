import { studyTable } from "@/db/schema/study";
import { StudyStep, StudyStepInsert } from "../../studyStep/model/StudyStep";


export type StudyInsert = typeof studyTable.$inferInsert;

export type StudyInsertFull = StudyInsert & {
    steps: StudyStepInsert[]
}


export type Study = typeof studyTable.$inferSelect;

export type StudyFull = Study & {
    steps: StudyStep[]
}

