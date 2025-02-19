import { studyStepTable } from "@/db/schema/studyStep";


export type StudyStepInsert = typeof studyStepTable.$inferInsert;

export type StudyStep = typeof studyStepTable.$inferSelect;
