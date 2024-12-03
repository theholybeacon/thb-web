import { BibleRepository } from "@/app/_common/bible/repository/BibleRepository";
import { BookRepository } from "@/app/_common/book/repository/BookRepository";
import { logger } from "@/app/_utils/logger";
import { ChapterRepository } from "../../chapter/repository/ChapterRepository";
import { VerseRepository } from "../../verse/repository/VerseRepository";

const log = logger.child({ module: 'InitialLoadSS' });
export async function InitialLoadSS() {


	const bibleRepository = new BibleRepository();
	const bookRepository = new BookRepository();
	const chapterRepository = new ChapterRepository();
	const verseRepository = new VerseRepository();
	log.trace("execute");
	const bible = await bibleRepository.getById("de4e12af7f28f599-02");

	//for (const actualBible of bibles) {
	const books = await bookRepository.getAllByBibleId(bible!.id);
	log.trace(books);

	for (const book of books) {
		for (let i = 0; i < book.numChapters; i++) {
			const chapter = await chapterRepository.create({
				bookId: book.id,
				chapterNumber: i,
				numVerses: 0,
				createdAt: new Date(),
				updatedAt: new Date()
			});
			for (let j = 0; i < book.numChapters + 1; i++) {

				const verseContent = await verseRepository.getByBibleApiIdAndAbbreviations(bible?.apiId!, book.abbreviation, chapter.chapterNumber, j);
				const verse = await verseRepository.create({
					verseNumber: j,
					content: verseContent,
					chapterId: chapter.id,
					createdAt: new Date(),
					updatedAt: new Date(),
				});
			}

		}
	}
	//}


}


