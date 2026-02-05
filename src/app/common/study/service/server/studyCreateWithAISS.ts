"use server";

import { StudyFull, StudyInsert, StudyInsertFull } from "../../model/Study";
import { AIRepository } from "@/app/common/ai/repository/AIRepository";
import { studyCreateSS } from "./studyCreateSS";
import { BibleRepository } from "@/app/common/bible/repository/BibleRepository";

export async function studyCreateWithAISS(input: StudyInsert, bibleId: string): Promise<StudyFull> {
    const aiRepository = new AIRepository();
    const bibleRepository = new BibleRepository();

    const bible = await bibleRepository.getById(bibleId);

    if (!bible) {
        throw new Error("Bible not found");
    }

    const steps = await aiRepository.studyStepsCreate(input, bible);

    const fullInsertStudy: StudyInsertFull = {
        ...input,
        bibleId,
        steps,
    };

    return await studyCreateSS(fullInsertStudy);
}



