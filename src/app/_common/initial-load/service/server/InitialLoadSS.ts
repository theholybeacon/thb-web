import { BibleRepository } from "@/app/_common/bible/repository/BibleRepository";
import { BookRepository } from "@/app/_common/book/repository/BookRepository";
import { logger } from "@/app/_utils/logger";

const log = logger.child({ module: 'InitialLoadSS' });
export class InitialLoadSS {

	_bibleRepository = new BibleRepository();
	_bookRepository = new BookRepository();

	async execute(): Promise<void> {
		log.trace("execute");
		const bibles = await this._bibleRepository.getAll();

		for (const actualBible of bibles) {
			const books = await this._bookRepository.getAllByBibleId(actualBible.apiId);


		}
	}
}


