import { StudyStepType } from "./StudyStepType";

export interface StudyStepFromAIDTO {
    stepNumber: number;
    title: string;
    explanation: string;

    stepType: StudyStepType;

    bookAbbreviation: string;
    chapterNumber: string;  // e.g., "1" or "1-3" for ranges
    verseNumber: string;    // e.g., "1" or "1-5" for ranges
}
