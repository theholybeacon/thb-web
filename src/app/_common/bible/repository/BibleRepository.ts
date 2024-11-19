import { logger } from "@/app/_utils/logger";
import { BibleExternalAPIDao } from "../dao/BibleExternalAPIDao";
import { BiblePostgreSQLDao } from "../dao/BiblePostgreSQLDao";
import { Bible } from "../model/Bible";

const log = logger.child({ module: 'BibleRepository' });
export class BibleRepository {
	_internalDao = new BiblePostgreSQLDao();
	_externalDao = new BibleExternalAPIDao();


	async getAll(): Promise<Bible[]> {
		log.trace("getAll");

		let output = await this._internalDao.getAll();

		if (output.length === 0) {
			output = await this._externalDao.getAll();
			output.map(async (actual) => {
				await this._internalDao.create(actual);
			});
		}

		return output;
	}
	async getById(bibleId: string): Promise<Bible> {
		return await this._internalDao.getByBibleId(bibleId);
	}

}

