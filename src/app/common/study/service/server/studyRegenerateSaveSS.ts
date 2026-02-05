'use server';

import { StudyFull } from "../../model/Study";
import { StudyRepository } from "../../repository/StudyRepository";
import { StudyStepRepository } from "@/app/common/studyStep/repository/StudyStepRepository";
import { SessionRepository } from "@/app/common/session/repository/SessionRepository";
import { StudyStepInsert } from "@/app/common/studyStep/model/StudyStep";

export async function studyRegenerateSaveSS(studyId: string, steps: StudyStepInsert[]): Promise<StudyFull> {
    const studyRepository = new StudyRepository();
    const studyStepRepository = new StudyStepRepository();
    const sessionRepository = new SessionRepository();

    // Get the existing study
    const study = await studyRepository.getById(studyId);
    if (!study) {
        throw new Error("Study not found");
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
