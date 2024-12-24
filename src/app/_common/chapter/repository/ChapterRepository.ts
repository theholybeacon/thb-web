import { BibleRepository } from "../../bible/repository/BibleRepository";
import { BookRepository } from "../../book/repository/BookRepository";
import { ChapterExternalAPIDao } from "../dao/ChapterExternalApiDao";
import { ChapterPostgreSQLDao } from "../dao/ChapterPostgreSQLDao";
import { Chapter, ChapterInsert, ChapterVer, ChapterVerNav } from "../model/Chapter";

export class ChapterRepository {
	private chapterInternalDao = new ChapterPostgreSQLDao();
	private chapterExternalDao = new ChapterExternalAPIDao();

	private bookRepository = new BookRepository();
	private bibleRepository = new BibleRepository();

	async create(chapter: ChapterInsert): Promise<Chapter> {
		return await this.chapterInternalDao.create(chapter);
	}

	async getAllByBookId(bookId: string): Promise<Chapter[]> {

		let output = await this.chapterInternalDao.getAllByBookId(bookId);

		if (output.length === 0) {
			const bookToFetch = await this.bookRepository.getById(bookId);
			const bibleToFetch = await this.bibleRepository.getById(bookToFetch.bibleId);

			output = await this.chapterExternalDao.getAllByBibleIdAndBookAbbreviation(
				bibleToFetch!.apiId,
				bookToFetch.apiId
			);
			output.map(async (actual) => {
				actual.bookId = bookToFetch.id;
				await this.chapterInternalDao.create(actual);
			});
		}
		return output;
	}

	async getById(id: string): Promise<Chapter> {
		return await this.chapterInternalDao.getById(id);
	}

	async getByBookIdAndChapterNumber(bookId: string, chapterNumber: number): Promise<ChapterVer> {
		const chapter = await this.chapterInternalDao.getByBookIdAndChapterNumber(bookId, chapterNumber);

		return chapter;
	}

	async update(chapter: Chapter): Promise<void> {
		return await this.chapterInternalDao.update(chapter);
	}



}
