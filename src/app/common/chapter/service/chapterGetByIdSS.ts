'use server';

import { ChapterRepository } from "../repository/ChapterRepository";
import { loadFullChapter } from "./chapterLoad";
import { ChapterFull } from "../model/Chapter";

export async function chapterGetByIdSS(chapterId: string): Promise<ChapterFull | null> {
    const chapterRepo = new ChapterRepository();

    try {
        // Get chapter with book relationship
        const chapterWithBook = await chapterRepo.getByIdWithBook(chapterId);
        if (!chapterWithBook) return null;

        // Short of the verse count upstream reported: hydrate the rest. This
        // was dead code until hydration began writing numVerses — the column
        // read 0 for every chapter, so nothing ever looked incomplete.
        if (chapterWithBook.verses.length < (chapterWithBook.numVerses || 0)) {
            const fullChapter = await loadFullChapter(chapterWithBook.bookId, chapterWithBook.chapterNumber);
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
