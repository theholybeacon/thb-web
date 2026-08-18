import { DictionaryPostgreSQLDao } from "../dao/DictionaryPostgreSQLDao";
import { DictionaryFreeApiDao } from "../dao/DictionaryFreeApiDao";
import { DictionaryEntry, DictionaryPayload } from "../model/Dictionary";

export class DictionaryRepository {

	private dictionaryPostgreSQLDao = new DictionaryPostgreSQLDao();
	private dictionaryFreeApiDao = new DictionaryFreeApiDao();

	async get(lang: string, word: string): Promise<DictionaryEntry | null> {
		return await this.dictionaryPostgreSQLDao.get(lang, word);
	}

	async ensureRow(lang: string, word: string): Promise<void> {
		return await this.dictionaryPostgreSQLDao.ensureRow(lang, word);
	}

	async claimForFetch(lang: string, word: string): Promise<boolean> {
		return await this.dictionaryPostgreSQLDao.claimForFetch(lang, word);
	}

	async markReady(lang: string, word: string, payload: DictionaryPayload): Promise<void> {
		return await this.dictionaryPostgreSQLDao.markReady(lang, word, payload);
	}

	async markFailed(lang: string, word: string, error: string): Promise<void> {
		return await this.dictionaryPostgreSQLDao.markFailed(lang, word, error);
	}

	async reclaimStale(olderThanMs: number): Promise<number> {
		return await this.dictionaryPostgreSQLDao.reclaimStale(olderThanMs);
	}

	/** Fetches from the upstream provider. No caching — that is the service's job. */
	async fetchUpstream(lang: string, word: string): Promise<DictionaryPayload> {
		return await this.dictionaryFreeApiDao.lookup(lang, word);
	}
}
