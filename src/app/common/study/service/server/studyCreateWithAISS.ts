"use server";

import { StudyFull, StudyInsert, StudyInsertFull } from "../../model/Study";
import { AIRepository } from "@/app/common/ai/repository/AIRepository";
import { studyCreateSS } from "./studyCreateSS";

export async function studyCreateWithAISS(input: StudyInsert): Promise<StudyFull> {


    const aiRepository = new AIRepository();


    const steps = await aiRepository.studyStepsCreate(input);

    const fullInsertStudy: StudyInsertFull = {
        ...input,
        steps,
    };

    return await studyCreateSS(fullInsertStudy);
}



