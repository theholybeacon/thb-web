import { logger } from "@/app/utils/logger";
import { and, eq, inArray, lt } from "drizzle-orm";
import { db } from "@/db";
import { dictionaryEntryTable } from "@/db/schema/dictionaryEntry";
import { DictionaryEntry, DictionaryPayload } from "../model/Dictionary";

const log = logger.child({ module: "DictionaryPostgreSQLDao" });

export class DictionaryPostgreSQLDao {

	async get(lang: string, word: string): Promise<DictionaryEntry | null> {
		log.trace("get");
		const rows = await db
			.select()
			.from(dictionaryEntryTable)
			.where(and(eq(dictionaryEntryTable.lang, lang), eq(dictionaryEntryTable.word, word)))
			.limit(1);
		return rows[0] ?? null;
	}

	/** Ensure a row exists (starts `pending`) without disturbing an existing one. */
	async ensureRow(lang: string, word: string): Promise<void> {
		log.trace("ensureRow");
		await db.insert(dictionaryEntryTable).values({ lang, word }).onConflictDoNothing();
	}

	/**
	 * Atomically claim the outbound fetch. Only the caller that flips the row
	 * pending/failed → generating gets true; everyone else reads the cache. This
	 * is what keeps a hundred readers highlighting the same word from becoming a
	 * hundred requests against a per-IP rate limit we all share.
	 */
	async claimForFetch(lang: string, word: string): Promise<boolean> {
		log.trace("claimForFetch");
		const rows = await db
			.update(dictionaryEntryTable)
			.set({ status: "generating", error: null, updatedAt: new Date() })
			.where(
				and(
					eq(dictionaryEntryTable.lang, lang),
					eq(dictionaryEntryTable.word, word),
					inArray(dictionaryEntryTable.status, ["pending", "failed"]),
				),
			)
			.returning({ id: dictionaryEntryTable.id });
		return rows.length > 0;
	}

	/**
	 * Stores the result. A word with no entries is still `ready` — "this is not a
	 * word" is a correct answer worth caching, and without it every stray
	 * selection would re-hit the API forever.
	 */
	async markReady(lang: string, word: string, payload: DictionaryPayload): Promise<void> {
		await db
			.update(dictionaryEntryTable)
			.set({ status: "ready", payload, error: null, fetchedAt: new Date(), updatedAt: new Date() })
			.where(and(eq(dictionaryEntryTable.lang, lang), eq(dictionaryEntryTable.word, word)));
	}

	async markFailed(lang: string, word: string, error: string): Promise<void> {
		log.warn({ lang, word, error }, "dictionary lookup failed");
		await db
			.update(dictionaryEntryTable)
			.set({ status: "failed", error, updatedAt: new Date() })
			.where(and(eq(dictionaryEntryTable.lang, lang), eq(dictionaryEntryTable.word, word)));
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
