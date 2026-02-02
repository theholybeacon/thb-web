"use server";
import { logger } from "@/app/utils/logger";
import { BookRepository } from "../../book/repository/BookRepository";
import { ChapterVerNav } from "../model/Chapter";
import { ChapterRepository } from "../repository/ChapterRepository";

const log = logger.child({ module: 'chapterGetForMainSS' });
export async function chapterGetForMainSS(bookId: string, chapterNumber: number): Promise<ChapterVerNav> {

   const chapterRepo = new ChapterRepository();
   const bookRepo = new BookRepository();


   const mainChapter = await chapterRepo.getFullChapter(bookId, chapterNumber) as ChapterVerNav;
   const book = await bookRepo.getById(bookId);

   if (mainChapter.chapterNumber !== 0) {
      mainChapter.prev = await chapterRepo.getFullChapter(mainChapter.bookId, mainChapter.chapterNumber - 1);
   }


   if (mainChapter.chapterNumber + 1 <= (book.numChapters || 0)) {
      mainChapter.next = await chapterRepo.getFullChapter(mainChapter.bookId, mainChapter.chapterNumber + 1);
   } else {
      //TODO get next book

   }

   return mainChapter;
}
