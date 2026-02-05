"use server";

import { StudyStepInsert } from "@/app/common/studyStep/model/StudyStep";
import { StudyStepFromAIDTO } from "@/app/common/studyStep/model/StudyStepFromAIDTO";
import { StudyStepType } from "@/app/common/studyStep/model/StudyStepType";

/**
 * Converts AI-generated study step data into a StudyStepInsert with canonical references.
 * No database lookups needed - just parses the string formats into structured data.
 */
export async function aiStudyStepAbbreviatonToIdParserSS(input: StudyStepFromAIDTO): Promise<StudyStepInsert> {
    // Ensure required fields have fallback values
    const title = input.title || `Step ${input.stepNumber}`;
    const explanation = input.explanation || `Read and meditate on ${input.bookAbbreviation}${input.chapterNumber ? ` ${input.chapterNumber}` : ''}${input.verseNumber ? `:${input.verseNumber}` : ''}.`;

    const out: StudyStepInsert = {
        studyId: "",
        title,
        stepType: input.stepType,
        stepNumber: input.stepNumber,
        explanation,
        bookAbbreviation: input.bookAbbreviation,
    };

    switch (input.stepType) {
        case StudyStepType.FullBook:
            // Just the book, no chapter/verse needed
            break;

        case StudyStepType.ChapterRange:
            const chapterRangeSplit = input.chapterNumber.split("-");
            out.startChapter = Number(chapterRangeSplit[0]);
            out.endChapter = Number(chapterRangeSplit[1]);
            break;

        case StudyStepType.SingleChapter:
            out.startChapter = Number(input.chapterNumber);
            out.endChapter = Number(input.chapterNumber);
            break;

        case StudyStepType.VerseRange:
            out.startChapter = Number(input.chapterNumber);
            out.endChapter = Number(input.chapterNumber);
            const verseRangeSplit = input.verseNumber.split("-");
            out.startVerse = Number(verseRangeSplit[0]);
            out.endVerse = Number(verseRangeSplit[1]);
            break;

        case StudyStepType.SingleVerse:
            out.startChapter = Number(input.chapterNumber);
            out.endChapter = Number(input.chapterNumber);
            out.startVerse = Number(input.verseNumber);
            out.endVerse = Number(input.verseNumber);
            break;
    }

    return out;
}
