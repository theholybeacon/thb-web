'use server';

import { ChapterVer } from "../model/Chapter";
import { ChapterRepository } from "../repository/ChapterRepository";
import { logger } from "@/app/utils/logger";

const log = logger.child({ module: 'chapterGetByBookIdSS' });

export type ChapterWithBookName = ChapterVer & {
    bookName: string;
};

/**
 * Fetches a chapter by bookId and chapter number.
 * Skips the redundant book lookup since the caller already has the book.
 */
export async function chapterGetByBookIdSS(
    bookId: string,
    bookName: string,
    chapterNumber: number
): Promise<ChapterWithBookName | null> {
    log.trace("chapterGetByBookIdSS");

    try {
        const chapterRepository = new ChapterRepository();

        log.debug(`Fetching chapter: bookId=${bookId}, chapter=${chapterNumber}`);

        const chapter = await chapterRepository.getFullChapter(bookId, chapterNumber);

        return {
            ...chapter,
            bookName,
        };
    } catch (error) {
        log.error(`Error fetching chapter: ${error instanceof Error ? error.message : String(error)}`);
        return null;
    }
}
