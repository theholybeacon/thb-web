'use server';

import { StudyFull } from "../../model/Study";
import { StudyRepository } from "../../repository/StudyRepository";
import { StudyStepRepository } from "@/app/common/studyStep/repository/StudyStepRepository";
import { SessionRepository } from "@/app/common/session/repository/SessionRepository";
import { StudyStepInsert } from "@/app/common/studyStep/model/StudyStep";
import { requireOwnedStudySS } from "./studyOwnership";

export async function studyRegenerateSaveSS(studyId: string, steps: StudyStepInsert[]): Promise<StudyFull> {
    const studyRepository = new StudyRepository();
    const studyStepRepository = new StudyStepRepository();
    const sessionRepository = new SessionRepository();

    // Ownership, not just existence: this is a public endpoint that deletes
    // every step of whatever study id it is handed.
    const study = await requireOwnedStudySS(studyId);

    // An adopted plan's steps are an authored reading order, not AI output. The
    // detail page hides the button; this is the same rule on the server.
    if (study.sourceStudyId) {
        throw new Error("ADOPTED_PLAN_CANNOT_BE_REGENERATED");
    }

    // Delete sessions that reference this study's steps (to avoid FK constraint)
    await sessionRepository.deleteByStudyId(studyId);

    // Delete existing steps
    await studyRepository.deleteSteps(studyId);

    // Create new steps
    const createdSteps = [];
    for (const step of steps) {
        step.studyId = studyId;
        createdSteps.push(await studyStepRepository.create(step));
    }

    // Return updated study
    return {
        ...study,
        steps: createdSteps,
    } as StudyFull;
}
