import { logger } from "@/app/utils/logger";
import { and, eq, inArray, lt } from "drizzle-orm";
import { db } from "@/db";
import { dictionaryEntryTable } from "@/db/schema/dictionaryEntry";
import { DictionaryEntry, DictionaryKey, DictionaryPayload } from "../model/Dictionary";

const log = logger.child({ module: "DictionaryPostgreSQLDao" });

const byKey = ({ lang, definitionLang, word }: DictionaryKey) =>
	and(
		eq(dictionaryEntryTable.lang, lang),
		eq(dictionaryEntryTable.definitionLang, definitionLang),
		eq(dictionaryEntryTable.word, word),
	);

export class DictionaryPostgreSQLDao {

	async get(key: DictionaryKey): Promise<DictionaryEntry | null> {
		log.trace("get");
		const rows = await db.select().from(dictionaryEntryTable).where(byKey(key)).limit(1);
		return rows[0] ?? null;
	}

	/** Ensure a row exists (starts `pending`) without disturbing an existing one. */
	async ensureRow(key: DictionaryKey): Promise<void> {
		log.trace("ensureRow");
		await db.insert(dictionaryEntryTable).values(key).onConflictDoNothing();
	}

	/**
	 * Atomically claim the outbound fetch. Only the caller that flips the row
	 * pending/failed → generating gets true; everyone else reads the cache. This
	 * is what keeps a hundred readers highlighting the same word from becoming a
	 * hundred requests against a per-IP rate limit we all share.
	 */
	async claimForFetch(key: DictionaryKey): Promise<boolean> {
		log.trace("claimForFetch");
		const rows = await db
			.update(dictionaryEntryTable)
			.set({ status: "generating", error: null, updatedAt: new Date() })
			.where(and(byKey(key), inArray(dictionaryEntryTable.status, ["pending", "failed"])))
			.returning({ id: dictionaryEntryTable.id });
		return rows.length > 0;
	}

	/**
	 * Stores the result. A word with no entries is still `ready` — "this is not a
	 * word" is a correct answer worth caching, and without it every stray
	 * selection would re-hit the API forever.
	 */
	async markReady(key: DictionaryKey, payload: DictionaryPayload, source: string): Promise<void> {
		await db
			.update(dictionaryEntryTable)
			.set({ status: "ready", payload, source, error: null, fetchedAt: new Date(), updatedAt: new Date() })
			.where(byKey(key));
	}

	async markFailed(key: DictionaryKey, error: string): Promise<void> {
		log.warn({ ...key, error }, "dictionary lookup failed");
		await db
			.update(dictionaryEntryTable)
			.set({ status: "failed", error, updatedAt: new Date() })
			.where(byKey(key));
	}

	/** Releases rows stranded in `generating` by a crashed or timed-out request. */
	async reclaimStale(olderThanMs: number): Promise<number> {
		const cutoff = new Date(Date.now() - olderThanMs);
		const rows = await db
			.update(dictionaryEntryTable)
			.set({ status: "pending", error: "reclaimed: fetch timed out", updatedAt: new Date() })
			.where(
				and(
					eq(dictionaryEntryTable.status, "generating"),
					lt(dictionaryEntryTable.updatedAt, cutoff),
				),
			)
			.returning({ id: dictionaryEntryTable.id });
		if (rows.length > 0) log.warn({ count: rows.length }, "reclaimed stale dictionary fetches");
		return rows.length;
	}
}
