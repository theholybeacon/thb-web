
import { logger } from "@/app/_utils/logger";
import { BookExternalAPIDao } from "../dao/BookExternalAPIDao";
import { BookPostgreSQLDao } from "../dao/BookPostgreSQLDao";
import { Book } from "../model/Book";
import { BibleRepository } from "../../bible/repository/BibleRepository";

const log = logger.child({ module: 'BookRepository' });
export class BookRepository {
	_internalDao = new BookPostgreSQLDao();
	_externalDao = new BookExternalAPIDao();

	_bibleRepository = new BibleRepository();

	async getAllByBibleId(bibleId: string): Promise<Book[]> {
		log.trace("getAllByBibleId");

		let output = await this._internalDao.getAllByBibleId(bibleId);

		if (output.length === 0) {
			const bibleToFetch = this._bibleRepository.getById();
			output = await this._externalDao.getAllByBibleId(bibleId);
			output.map(async (actual) => {
				await this._internalDao.create(actual);
			});
		}

		return output;
	}

	async create(book: Book): Promise<string> {
		log.trace("getAllByBibleId");
		return await this._internalDao.create(book);
	}
}

