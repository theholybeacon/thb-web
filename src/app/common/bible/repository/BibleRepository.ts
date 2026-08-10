import { logger } from "@/app/utils/logger";
import { BibleExternalAPIDao } from "../dao/BibleExternalAPIDao";
import { BiblePostgreSQLDao } from "../dao/BiblePostgreSQLDao";
import { Bible, BibleWithBooks } from "../model/Bible";

const log = logger.child({ module: 'BibleRepository' });
export class BibleRepository {
	private internalBibleDao = new BiblePostgreSQLDao();
	private externalDao = new BibleExternalAPIDao();


	async getAll(): Promise<Bible[]> {
		log.trace("getAll");

		let output = await this.internalBibleDao.getAll();

		if (output.length === 0) {
			output = await this.externalDao.getAll();
			// Was `output.map(async ...)` with no await — the seed writes were fired and
			// forgotten, so getAll() could return before a single row was persisted.
			await Promise.all(output.map((actual) => this.internalBibleDao.create(actual)));
		}

		return output;
	}
	async getById(id: string): Promise<BibleWithBooks | undefined> {
		return await this.internalBibleDao.getById(id);
	}

	async getBasicById(id: string): Promise<Bible | undefined> {
		return await this.internalBibleDao.getBasicById(id);
	}

	async getByApiId(apiId: string): Promise<Bible | undefined> {
		return await this.internalBibleDao.getByApiId(apiId);
	}

	async getBySlug(slug: string): Promise<Bible | undefined> {
		return await this.internalBibleDao.getBySlug(slug);
	}

	async updateBookNumber(n: number, bibleId: string): Promise<void> {
		return await this.internalBibleDao.updateBookNumber(n, bibleId);
	}

}

