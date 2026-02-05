'use server';

import { ChapterRepository } from "../repository/ChapterRepository";
import { ChapterFull } from "../model/Chapter";

export async function chapterGetByIdSS(chapterId: string): Promise<ChapterFull | null> {
    const chapterRepo = new ChapterRepository();

    try {
        // Get chapter with book relationship
        const chapterWithBook = await chapterRepo.getByIdWithBook(chapterId);
        if (!chapterWithBook) return null;

        // If we need to fetch verses from external API
        if (chapterWithBook.verses.length < (chapterWithBook.numVerses || 0)) {
            const fullChapter = await chapterRepo.getFullChapter(chapterWithBook.bookId, chapterWithBook.chapterNumber);
            return {
                ...fullChapter,
                book: chapterWithBook.book
            };
        }

        return chapterWithBook;
    } catch (error) {
        console.error("Error getting chapter by ID:", error);
        return null;
    }
}
