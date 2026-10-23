import { sessionStepCompletionTable } from "@/db/schema/sessionStepCompletion";

export type SessionStepCompletionInsert = typeof sessionStepCompletionTable.$inferInsert;
export type SessionStepCompletion = typeof sessionStepCompletionTable.$inferSelect;

export type StudyMode = "read" | "type" | "listen" | "dictation" | "done";

/** The ways through a scripture step, the modes the reader's toolbar switches between. */
export type ReadingMode = Exclude<StudyMode, "done">;
