import { BiblePostgreSQLDao } from "../../bible/dao/BiblePostgreSQLDao";
import { BookPostgreSQLDao } from "../../book/dao/BookPostgreSQLDao";
import { ChapterPostgreSQLDao } from "../dao/ChapterPostgreSQLDao";
import { Chapter, ChapterInsert, ChapterVer, ChapterVerNav } from "../model/Chapter";

export class ChapterRepository {
	private _chapterInternalDao = new ChapterPostgreSQLDao();
	private _bibleInternalDao = new BiblePostgreSQLDao();
	private _bookInternalDao = new BookPostgreSQLDao();

	async create(chapter: ChapterInsert): Promise<Chapter> {
		return await this._chapterInternalDao.create(chapter);
	}

	async getById(id: string): Promise<Chapter> {
		return await this._chapterInternalDao.getById(id);
	}

	async getByBookIdAndChapterNumber(bookId: string, chapterNumber: number): Promise<ChapterVer> {
		const chapter = await this._chapterInternalDao.getByBookIdAndChapterNumber(bookId, chapterNumber);

		if (!chapter || !chapter.verses || chapter.verses.length === 0) {

			const book = await this._bookInternalDao.getById(bookId);
			const bible = await this._bibleInternalDao.getById(book?.bibleId!);
			chapter = await this._chapterEternalDao.getByBookIdAndChapterNumber(bible?.apiId, bookId, chapterNumber);
		}
	}



}
