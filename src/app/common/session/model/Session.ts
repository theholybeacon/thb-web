import { sessionTable } from "@/db/schema/session";
import { User } from "../../user/model/User";
import { StudyFull, StudyFullWithBible } from "../../study/model/Study";
import { StudyStep } from "../../studyStep/model/StudyStep";

export type SessionInsert = typeof sessionTable.$inferInsert;

export type Session = typeof sessionTable.$inferSelect;

export type SessionFull = Session & {
    user: User;
    study: StudyFull;
    currentStep: StudyStep | null;
};

export type SessionFullWithBible = Session & {
    user: User;
    study: StudyFullWithBible;
    currentStep: StudyStep | null;
};
