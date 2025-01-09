"use server";
import { BibleRepository } from "@/app/common/bible/repository/BibleRepository";
import { BookRepository } from "@/app/common/book/repository/BookRepository";
import { logger } from "@/app/utils/logger";
import { ChapterRepository } from "../../chapter/repository/ChapterRepository";

const log = logger.child({ module: 'InitialLoadSS' });
export async function initialLoadSS() {


	const bibleRepository = new BibleRepository();
	const bookRepository = new BookRepository();
	const chapterRepository = new ChapterRepository();
	const bibles = await bibleRepository.getAll();

	for (const actualBible of bibles) {
		log.trace("Bible to fetch:" + actualBible.name);

		try {

			const books = await bookRepository.getAllByBibleId(actualBible!.id);

			for (const book of books) {
				log.trace("Book to fetch:" + book.name);
				const chapters = await chapterRepository.getAllByBookId(book.id);
			}
		}
		catch (e) {
			console.error(e);

		}
	}
}


