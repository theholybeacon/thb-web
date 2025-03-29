"use server";
import { logger } from "../../../utils/logger";
import { VerseRepository } from "../repository/VerseRepository";
import { Verse } from "../model/Verse";

const log = logger.child({ module: 'chapterGetForMainSS' });
export async function verseGetByChapterIdAndVerseNumberSS(chapterId: string, verseNumber: number): Promise<Verse> {
    log.trace("verseGetByBookIdAndVerseNumberSS");

    const repo = new VerseRepository();
    return await repo.getByChapterIdAndVerseNumber(chapterId, verseNumber);
}
