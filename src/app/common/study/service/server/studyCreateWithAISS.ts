"use server";

import { StudyFull, StudyInsert, StudyInsertFull } from "../../model/Study";
import { AIRepository } from "@/app/common/ai/repository/AIRepository";
import { studyCreateSS } from "./studyCreateSS";
import { BibleRepository } from "@/app/common/bible/repository/BibleRepository";

export async function studyCreateWithAISS(input: StudyInsert): Promise<StudyFull> {


    const aiRepository = new AIRepository();

    const bibleRepository = new BibleRepository();
    const bible = await bibleRepository.getById("fea849c2-2354-4d09-992a-83b11762cb8f");

    const steps = await aiRepository.studyStepsCreate(input, bible!);

    const fullInsertStudy: StudyInsertFull = {
        ...input,
        steps,
    };

    return await studyCreateSS(fullInsertStudy);
}



