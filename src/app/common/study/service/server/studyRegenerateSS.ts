'use server';

import { StudyFull } from "../../model/Study";
import { StudyRepository } from "../../repository/StudyRepository";
import { StudyStepRepository } from "@/app/common/studyStep/repository/StudyStepRepository";
import { AIRepository } from "@/app/common/ai/repository/AIRepository";
import { BibleRepository } from "@/app/common/bible/repository/BibleRepository";
import { SessionRepository } from "@/app/common/session/repository/SessionRepository";

export async function studyRegenerateSS(studyId: string): Promise<StudyFull> {
    const studyRepository = new StudyRepository();
    const studyStepRepository = new StudyStepRepository();
    const sessionRepository = new SessionRepository();
    const aiRepository = new AIRepository();
    const bibleRepository = new BibleRepository();

    // Get the existing study
    const study = await studyRepository.getById(studyId);
    if (!study) {
        throw new Error("Study not found");
    }

    // Get the Bible for AI generation (use the study's bibleId)
    if (!study.bibleId) {
        throw new Error("Study has no Bible translation selected");
    }
    const bible = await bibleRepository.getById(study.bibleId);
    if (!bible) {
        throw new Error("Bible translation not found");
    }

    // Generate new steps using AI
    const newSteps = await aiRepository.studyStepsCreate(
        {
            name: study.name,
            description: study.description,
            depth: study.depth,
            length: study.length,
            topic: study.topic,
            ownerId: study.ownerId,
        },
        bible
    );

    // Delete sessions that reference this study's steps (to avoid FK constraint)
    await sessionRepository.deleteByStudyId(studyId);

    // Delete existing steps
    await studyRepository.deleteSteps(studyId);

    // Create new steps
    const createdSteps = [];
    for (const step of newSteps) {
        step.studyId = studyId;
        createdSteps.push(await studyStepRepository.create(step));
    }

    // Return updated study
    return {
        ...study,
        steps: createdSteps,
    } as StudyFull;
}
