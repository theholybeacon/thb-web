import { StudyStepType } from "./StudyStepType";

export interface StudyStepFromAIDTO {
    stepNumber: number;
    title: string;
    explanation: string;

    stepType: StudyStepType;

    bibleAbbreviation: string;
    bookAbbrebiation: string;
    chapterNumber: string;
    verseNumber: string;
}

