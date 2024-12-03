import { logger } from "@/app/_utils/logger";
import { BibleExternalAPIDao } from "../dao/BibleExternalAPIDao";
import { BiblePostgreSQLDao } from "../dao/BiblePostgreSQLDao";
import { Bible } from "../model/Bible";

const log = logger.child({ module: 'BibleRepository' });
export class BibleRepository {
	private internalBibleDao = new BiblePostgreSQLDao();
	private externalDao = new BibleExternalAPIDao();


	async getAll(): Promise<Bible[]> {
		log.trace("getAll");

		let output = await this.internalBibleDao.getAll();

		if (output.length === 0) {
			output = await this.externalDao.getAll();
			output.map(async (actual) => {
				await this.internalBibleDao.create(actual);
			});
		}

		return output;
	}
	async getById(id: string): Promise<Bible | undefined> {
		return await this.internalBibleDao.getById(id);
	}

	async updateBookNumber(n: number, bibleId: string): Promise<void> {
		return await this.internalBibleDao.updateBookNumber(n, bibleId);
	}

}

