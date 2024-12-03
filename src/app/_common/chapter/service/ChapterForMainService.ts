import { ChapterVerNav } from "../model/Chapter";
import { ChapterRepository } from "../repository/ChapterRepository";

export class ChapterGetForMainService {

   _chapterRepo = new ChapterRepository();

   async execute(bookId: string, chapterNumber: number): Promise<ChapterVerNav> {

      const mainChapter = await this._chapterRepo.getByBookIdAndChapterNumber(bookId, chapterNumber) as ChapterVerNav;

      if (mainChapter.chapterNumber !== 0) {
         mainChapter.prev = await this._chapterRepo.getByBookIdAndChapterNumber(mainChapter.bookId, mainChapter.chapterNumber - 1);
      }
      mainChapter.next = await this._chapterRepo.getByBookIdAndChapterNumber(mainChapter.bookId, mainChapter.chapterNumber + 1);

      return mainChapter;

   }
}
