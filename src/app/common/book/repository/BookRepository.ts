
import { logger } from "@/app/utils/logger";
import { BookExternalAPIDao } from "../dao/BookExternalAPIDao";
import { BookPostgreSQLDao } from "../dao/BookPostgreSQLDao";
import { Book } from "../model/Book";
import { BibleRepository } from "../../bible/repository/BibleRepository";

const log = logger.child({ module: 'BookRepository' });
export class BookRepository {
	private internalDao = new BookPostgreSQLDao();
	private externalDao = new BookExternalAPIDao();

	_bibleRepository = new BibleRepository();

	async getAllByBibleId(bibleId: string): Promise<Book[]> {
		log.trace("getAllByBibleId");

		let output = await this.internalDao.getAllByBibleId(bibleId);

		if (output.length === 0) {
			const bibleToFetch = await this._bibleRepository.getById(bibleId);
			output = await this.externalDao.getAllByBibleId(bibleToFetch!.apiId);
			await Promise.all(output.map(async (actual) => {
				actual.bibleId = bibleId;
				await this.internalDao.create(actual);
			}));
			await this._bibleRepository.updateBookNumber(output.length, bibleId);
		}
		return output;
	}
	async getById(bookId: string): Promise<Book> {
		return await this.internalDao.getById(bookId)!;
	}

	async create(book: Book): Promise<Book> {
		log.trace("getAllByBibleId");
		return await this.internalDao.create(book);
	}

	async getByAbbreviationAndBibleId(bibleId: string, abbreviation: string): Promise<Book | null> {
		return await this.internalDao.getByAbbreviationAndBibleId(bibleId, abbreviation);
	}

	async getBySlugAndBibleId(bibleId: string, slug: string): Promise<Book | null> {
		return await this.internalDao.getBySlugAndBibleId(bibleId, slug);
	}

	async getNextByOrder(bibleId: string, currentBookOrder: number): Promise<Book | null> {
		return await this.internalDao.getNextByOrder(bibleId, currentBookOrder);
	}
}

