import { StudyStepType } from "./StudyStepType";

/**
 * One step as the study generator returns it. `kind` is "scripture" (or
 * missing, for a generator that predates kinds), "text" or "reflection"; the
 * generator does not produce images, videos, links or characters, which need
 * sources it cannot verify.
 */
export interface StudyStepFromAIDTO {
    stepNumber: number;
    title: string;
    explanation: string;

    kind?: "scripture" | "text" | "reflection";

    stepType: StudyStepType;

    bookAbbreviation: string;
    chapterNumber: string;  // e.g., "1" or "1-3" for ranges
    verseNumber: string;    // e.g., "1" or "1-5" for ranges

    /** kind "text": the paragraphs, separated by a blank line. */
    body?: string;
    /** kind "reflection": the question the reader answers. */
    prompt?: string;
}
