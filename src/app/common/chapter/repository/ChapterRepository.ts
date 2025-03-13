import { logger } from "@/app/utils/logger";
import { BibleRepository } from "../../bible/repository/BibleRepository";
import { BookRepository } from "../../book/repository/BookRepository";
import { VerseRepository } from "../../verse/repository/VerseRepository";
import { ChapterExternalAPIDao } from "../dao/ChapterExternalApiDao";
import { ChapterPostgreSQLDao } from "../dao/ChapterPostgreSQLDao";
import { Chapter, ChapterInsert, ChapterVer, ChapterVerNav } from "../model/Chapter";

const log = logger.child({ module: 'ChapterRepository' });
export class ChapterRepository {
	private chapterInternalDao = new ChapterPostgreSQLDao();
	private chapterExternalDao = new ChapterExternalAPIDao();

	private bookRepository = new BookRepository();
	private bibleRepository = new BibleRepository();
	private verseRepository = new VerseRepository();

	async create(chapter: ChapterInsert): Promise<Chapter> {
		return await this.chapterInternalDao.create(chapter);
	}

	async getAllByBookId(bookId: string): Promise<Chapter[]> {

		let output = await this.chapterInternalDao.getAllByBookId(bookId);

		if (output.length === 0) {
			const bookToFetch = await this.bookRepository.getById(bookId);
			const bibleToFetch = await this.bibleRepository.getById(bookToFetch.bibleId);

			output = await this.chapterExternalDao.getAllByBibleApiIdAndBookAbbreviation(
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

	async getFullChapter(bookId: string, chapterNumber: number): Promise<ChapterVer> {
		log.trace("getFullChapter");

		const chapter = await this.chapterInternalDao.getByBookIdAndChapterNumber(bookId, chapterNumber)!;

		if (chapter?.verses.length === chapter?.numVerses) {
			const bookToFetch = await this.bookRepository.getById(bookId);
			const bibleToFetch = await this.bibleRepository.getById(bookToFetch.bibleId);
			log.debug(chapter);
			let verseNumber = 1;
			let prevContent = "";
			while (true) {
				try {
					let verseToAdd = await this.verseRepository.getByBibleApiIdAndVerseAbbreviation(
						bibleToFetch!.apiId,
						bookToFetch.apiId,
						chapterNumber,
						verseNumber
					);
					verseNumber++;
					verseToAdd.chapterId = chapter?.id!;

					if (prevContent === verseToAdd.content) {
						break;
					} else {
						prevContent = verseToAdd.content;
					}

					const addedVerse = await this.verseRepository.create(verseToAdd);
					chapter?.verses.push(addedVerse);

				} catch (e) {
					log.error(e);
					break;

				}
			}
			chapter!.numVerses = verseNumber;
			this.chapterInternalDao.update(chapter as Chapter);
		}
		return chapter!;
	}

	async update(chapter: Chapter): Promise<void> {
		return await this.chapterInternalDao.update(chapter);
	}


	async getByBookIdAndChapterNumber(bookId: string, chapterNumber: number): Promise<ChapterVer | undefined> {
		return await this.chapterInternalDao.getByBookIdAndChapterNumber(bookId, chapterNumber);
	}


}
