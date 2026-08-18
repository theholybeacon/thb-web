import { Verse, VerseInsert } from "../model/Verse";
import { VersePostgreSQLDao } from "../dao/VersePostgreSQLDao";

export class VerseRepository {



	private versePostgreSQLDao = new VersePostgreSQLDao();

	async create(verse: VerseInsert): Promise<Verse> {
		return await this.versePostgreSQLDao.create(verse);
	}

	/** A whole chapter's verses in one insert. See VersePostgreSQLDao.createMany. */
	async createMany(verses: VerseInsert[]): Promise<Verse[]> {
		return await this.versePostgreSQLDao.createMany(verses);
	}



	async getByChapterIdAndVerseNumber(chapterId: string, verseNumber: number): Promise<Verse> {
		return await this.versePostgreSQLDao.getByChapterIdAndVerseNumber(chapterId, verseNumber);

	}
}
