"use server";

import { bookGetByAbbreviationAndBibleIdSS } from "@/app/common/book/service/server/bookGetByAbbreviationAndBibleIdSS";
import { chapterGetByBookIdAndChapterNumberSS } from "@/app/common/chapter/service/chapterGetByBookIdAndChapterNumberSS";
import { StudyStep, StudyStepInsert } from "@/app/common/studyStep/model/StudyStep";
import { StudyStepFromAIDTO } from "@/app/common/studyStep/model/StudyStepFromAIDTO";
import { StudyStepType } from "@/app/common/studyStep/model/StudyStepType";
import { verseGetByChapterIdAndVerseNumberSS } from "@/app/common/verse/service/verseGetByChapterIdAndVerseNumberSS";


export async function aiStudyStepAbbreviatonToIdParserSS(input: StudyStepFromAIDTO): Promise<StudyStepInsert> {
    let out: StudyStepInsert = {
        studyId: "",
        title: input.title,
        stepType: input.stepType,
        stepNumber: input.stepNumber,
        explanation: input.explanation,
        bibleId: input.bibleId
    };

    const book = await bookGetByAbbreviationAndBibleIdSS(input.bibleId, input.bookAbbreviation);
    const chapter = await chapterGetByBookIdAndChapterNumberSS(book.id, Number(input.chapterNumber!));


    switch (input.stepType) {
        case StudyStepType.FullBook:
            out.startBookId = book.id;
            break;
        case StudyStepType.ChapterRange:
            const chapterRangeSplit = input.chapterNumber.split("-");
            const startChapterNumber = Number(chapterRangeSplit.at(0));
            const endChapterNumber = Number(chapterRangeSplit.at(1));

            const startChapter = await chapterGetByBookIdAndChapterNumberSS(book.id, startChapterNumber);
            out.startChapterId = startChapter.id;

            const endChapter = await chapterGetByBookIdAndChapterNumberSS(book.id, endChapterNumber);
            out.endChapterId = endChapter.id;

            break;
        case StudyStepType.SingleChapter:
            out.startChapterId = chapter.id;
            break;

        case StudyStepType.VerseRange:
            const verseRangeSplit = input.verseNumber.split("-");
            const startVerseNumber = Number(verseRangeSplit.at(0));
            const endVerseNumber = Number(verseRangeSplit.at(1));

            const startVerse = await verseGetByChapterIdAndVerseNumberSS(chapter.id, startVerseNumber);
            out.startVerseId = startVerse.id;
            const endVerse = await verseGetByChapterIdAndVerseNumberSS(chapter.id, endVerseNumber);
            out.endVerseId = endVerse.id;
            break;
        case StudyStepType.SingleVerse:
            const verse = await verseGetByChapterIdAndVerseNumberSS(chapter.id, Number(input.verseNumber));
            out.startVerseId = verse.id;
            break;
    }

    console.log(out);

    return out;

}
