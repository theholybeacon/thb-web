"use server";

import { StudyStep, StudyStepInsert } from "@/app/common/studyStep/model/StudyStep";
import { StudyStepFromAIDTO } from "@/app/common/studyStep/model/StudyStepFromAIDTO";
import { StudyStepType } from "@/app/common/studyStep/model/StudyStepType";


export async function aiStudyStepAbbreviatonToIdParserSS(input: StudyStepFromAIDTO): Promise<StudyStepInsert> {
    let out: StudyStepInsert = {
        studyId: "",
        title: input.title,
        stepType: input.stepType,
        stepNumber: input.stepNumber,
        explanation: input.explanation,

    };

    switch (input.stepType) {
        case StudyStepType.FullBook:
            //getBookByAbbreviationAndBibleIdSS
            break;
        case StudyStepType.ChapterRange:
            //split range
            //getChapterByAbbreviationAndBibleIdSS
            //getChapterByAbbreviationAndBibleIdSS
            break;
        case StudyStepType.SingleChapter:
            //getChapterByAbbreviationAndBibleIdSS
            break;
        case StudyStepType.VerseRange:
            //split range
            //getVerseByAbbreviationAndBibleIdSS
            //getVerseByAbbreviationAndBibleIdSS
            break;
        case StudyStepType.SingleVerse:
            //getVerseByAbbreviationAndBibleIdSS
            break;
    }

    return out;

}
