'use server';

import { ChapterVer } from "../model/Chapter";
import { ChapterRepository } from "../repository/ChapterRepository";
import { BookRepository } from "../../book/repository/BookRepository";
import { logger } from "@/app/utils/logger";

const log = logger.child({ module: 'chapterGetByCanonicalRefSS' });

export type ChapterWithBookName = ChapterVer & {
    bookName: string;
};

/**
 * Fetches a chapter by canonical reference (bibleId, bookAbbreviation, chapterNumber).
 * This works across different Bible translations by using the book abbreviation
 * to look up the book in the specified Bible translation.
 */
export async function chapterGetByCanonicalRefSS(
    bibleId: string,
    bookAbbreviation: string,
    chapterNumber: number
): Promise<ChapterWithBookName | null> {
    log.trace("chapterGetByCanonicalRefSS");

    try {
        const bookRepository = new BookRepository();
        const chapterRepository = new ChapterRepository();

        log.debug(`Fetching chapter: bibleId=${bibleId}, book=${bookAbbreviation}, chapter=${chapterNumber}`);

        // First, ensure books are loaded for this Bible
        const allBooks = await bookRepository.getAllByBibleId(bibleId);
        log.debug(`Found ${allBooks.length} books for Bible`);

        // Find the book by abbreviation in the specified Bible (case-insensitive)
        const book = await bookRepository.getByAbbreviationAndBibleId(bibleId, bookAbbreviation);

        if (!book) {
            // Try to find a matching book for debugging
            const matchingBooks = allBooks.filter(b =>
                b.abbreviation.toLowerCase().includes(bookAbbreviation.toLowerCase()) ||
                bookAbbreviation.toLowerCase().includes(b.abbreviation.toLowerCase())
            );
            log.warn(`Book not found: ${bookAbbreviation}. Similar books: ${matchingBooks.map(b => b.abbreviation).join(', ')}`);
            return null;
        }

        log.debug(`Found book: ${book.name} (${book.abbreviation})`);

        // Get the full chapter with verses
        const chapter = await chapterRepository.getFullChapter(book.id, chapterNumber);

        return {
            ...chapter,
            bookName: book.name,
        };
    } catch (error) {
        log.error(`Error fetching chapter: ${error instanceof Error ? error.message : String(error)}`);
        return null;
    }
}
