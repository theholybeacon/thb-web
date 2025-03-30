"use server";
import { logger } from "../../../utils/logger";
import { Chapter } from "../model/Chapter";
import { ChapterRepository } from "../repository/ChapterRepository";

const log = logger.child({ module: 'chapterGetForMainSS' });
export async function chapterGetByBookIdAndChapterNumberSS(bookId: string, chapterNumber: number): Promise<Chapter> {
   log.trace("chapterGetByNumberAndBookIdSS");

   const repo = new ChapterRepository();
   return await repo.getByBookIdAndChapterNumber(bookId, chapterNumber) as Chapter;
}
