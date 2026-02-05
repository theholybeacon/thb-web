import { sessionStepCompletionTable } from "@/db/schema/sessionStepCompletion";

export type SessionStepCompletionInsert = typeof sessionStepCompletionTable.$inferInsert;
export type SessionStepCompletion = typeof sessionStepCompletionTable.$inferSelect;

export type StudyMode = "read" | "type" | "listen" | "dictation";
