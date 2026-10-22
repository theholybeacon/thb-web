import { DictionaryPostgreSQLDao } from "../dao/DictionaryPostgreSQLDao";
import { DictionaryFreeApiDao } from "../dao/DictionaryFreeApiDao";
import { DictionaryWiktionaryEsDao } from "../dao/DictionaryWiktionaryEsDao";
import { DictionaryEntry, DictionaryKey, DictionaryPayload } from "../model/Dictionary";

export class DictionaryRepository {

	private dictionaryPostgreSQLDao = new DictionaryPostgreSQLDao();
	private dictionaryFreeApiDao = new DictionaryFreeApiDao();
	private dictionaryWiktionaryEsDao = new DictionaryWiktionaryEsDao();

	async get(key: DictionaryKey): Promise<DictionaryEntry | null> {
		return await this.dictionaryPostgreSQLDao.get(key);
	}

	async ensureRow(key: DictionaryKey): Promise<void> {
		return await this.dictionaryPostgreSQLDao.ensureRow(key);
	}

	async claimForFetch(key: DictionaryKey): Promise<boolean> {
		return await this.dictionaryPostgreSQLDao.claimForFetch(key);
	}

	async markReady(key: DictionaryKey, payload: DictionaryPayload, source: string): Promise<void> {
		return await this.dictionaryPostgreSQLDao.markReady(key, payload, source);
	}

	async markFailed(key: DictionaryKey, error: string): Promise<void> {
		return await this.dictionaryPostgreSQLDao.markFailed(key, error);
	}

	async reclaimStale(olderThanMs: number): Promise<number> {
		return await this.dictionaryPostgreSQLDao.reclaimStale(olderThanMs);
	}

	/**
	 * Fetches from the provider that writes definitions in `definitionLang`. No
	 * caching — that is the service's job.
	 */
	async fetchUpstream(key: DictionaryKey): Promise<{ payload: DictionaryPayload; source: string }> {
		if (key.definitionLang === "es") {
			return { payload: await this.dictionaryWiktionaryEsDao.lookup(key.lang, key.word), source: "wiktionary-es" };
		}
		return { payload: await this.dictionaryFreeApiDao.lookup(key.lang, key.word), source: "freedictionaryapi" };
	}
}
