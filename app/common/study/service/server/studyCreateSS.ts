"use server";

import { StudyStepRepository } from "../../../studyStep/repository/StudyStepRepository";
import { StudyFull, StudyInsertFull } from "../../model/Study";
import { StudyRepository } from "../../repository/StudyRepository";

export async function studyCreateSS(input: StudyInsertFull): Promise<StudyFull> {

    const studyRepository = new StudyRepository();
    const studyStepRepository = new StudyStepRepository();

    const returnedStudy: StudyFull = await studyRepository.create(input) as StudyFull;
    returnedStudy.steps = [];

    for (let step of input.steps) {
        step.studyId = returnedStudy.id;

        returnedStudy.steps.push(await studyStepRepository.create(step));
    }

    return returnedStudy;
}


