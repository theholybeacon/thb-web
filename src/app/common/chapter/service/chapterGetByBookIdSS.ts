'use server';

import { ChapterVer } from "../model/Chapter";
import { loadFullChapter } from "./chapterLoad";
import { logger } from "@/app/utils/logger";

const log = logger.child({ module: 'chapterGetByBookIdSS' });

export type ChapterWithBookName = ChapterVer & {
    bookName: string;
};

/**
 * Fetches a chapter by bookId and chapter number.
 * Skips the redundant book lookup since the caller already has the book.
 *
 * On an unexpected failure this returns a shell carrying `loadError` rather
 * than null. Returning null used to render as "No content available for this
 * chapter", which told readers the scripture was missing when in fact the
 * fetch had broken — see ChapterFetchError.
 */
export async function chapterGetByBookIdSS(
    bookId: string,
    bookName: string,
    chapterNumber: number
): Promise<ChapterWithBookName | null> {
    log.trace("chapterGetByBookIdSS");

    try {
        log.debug(`Fetching chapter: bookId=${bookId}, chapter=${chapterNumber}`);

        const chapter = await loadFullChapter(bookId, chapterNumber);

        return {
            ...chapter,
            bookName,
        };
    } catch (error) {
        log.error(`Error fetching chapter: ${error instanceof Error ? error.message : String(error)}`);
        return null;
    }
}
