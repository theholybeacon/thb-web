import { StudyStepType } from "./StudyStepType";

export interface StudyStepFromAIDTO {
    stepNumber: number;
    title: string;
    explanation: string;

    stepType: StudyStepType;

    bibleId: string;
    bookAbbreviation: string;
    chapterNumber: string;
    verseNumber: string;
}

