import { Verse, VerseInsert } from "../model/Verse";
import { VersePostgreSQLDao } from "../dao/VersePostgreSQLDao";
import { VerseExternalDao } from "../dao/VerseExternalAPIDao";

export class VerseRepository {



	private versePostgreSQLDao = new VersePostgreSQLDao();
	private verseExternalDao = new VerseExternalDao();

	async create(verse: VerseInsert): Promise<Verse> {
		return await this.versePostgreSQLDao.create(verse);
	}


	async getByBibleApiIdAndVerseAbbreviation(bibleApiId: string, bookApiId: string, chapterNumber: number, verseNumber: number): Promise<VerseInsert> {
		return await this.verseExternalDao.getByBibleApiIdAndVerseAbbreviation(bibleApiId, bookApiId, chapterNumber, verseNumber);
	}
}
