import { Verse, VerseInsert } from "../model/Verse";
import { VersePostgreSQLDao } from "../dao/VersePostgreSQLDao";
import { VerseExternalDao } from "../dao/VerseExternalAPIDao";

export class VerseRepository {



	private versePostgreSQLDao = new VersePostgreSQLDao();
	private verseExternalDao = new VerseExternalDao();

	async create(verse: VerseInsert): Promise<Verse> {
		return await this.versePostgreSQLDao.create(verse);
	}

	async getByBibleApiIdAndAbbreviations(bibleApiId: string, bookAbbreviation: string, chapterNumber: number, verseNumber: number): Promise<string | null> {
		return await this.verseExternalDao.getByBibleApiIdAndAbbreviations(bibleApiId, `${bookAbbreviation}.${chapterNumber}.${verseNumber}`);
	}

	async getById(id: string): Promise<Verse> {
		return await this.versePostgreSQLDao.getById(id);
	}
}
