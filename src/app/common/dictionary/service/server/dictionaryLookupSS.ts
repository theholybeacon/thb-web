"use server";

import { logger } from "@/app/utils/logger";
import { normalizeWord } from "@/lib/strongs";
import { DictionaryRepository } from "../../repository/DictionaryRepository";
import { DictionaryLookupResult } from "../../model/Dictionary";

const log = logger.child({ module: "dictionaryLookupSS" });

const STALE_FETCH_MS = 2 * 60 * 1000;
/** Longest thing we will look up. Beyond this it is a sentence, not a word. */
const MAX_WORD_LENGTH = 80;

function result(
	word: string,
	lang: string,
	status: DictionaryLookupResult["status"],
	payload: DictionaryLookupResult["payload"] = null,
): DictionaryLookupResult {
	return { word, lang, status, payload };
}

/**
 * Definition for a selected word, cached in Postgres and shared by all readers.
 *
 * Mirrors entityContentEnsureSS: ensureRow → claimForFetch (conditional UPDATE
 * lock) → fetch → markReady/markFailed. Unlike that one this is open to
 * anonymous readers, because the public /bible reader is the main place people
 * highlight words — the cache and the claim lock are what make that safe
 * against the upstream per-IP rate limit.
 *
 * Never throws: the panel degrades to "unavailable" rather than breaking the
 * reader for a failed side lookup.
 */
export async function dictionaryLookupSS(
	rawWord: string,
	lang: string,
): Promise<DictionaryLookupResult> {
	const word = normalizeWord(rawWord);

	if (!word || !lang) return result(word, lang, "unavailable");
	if (word.length > MAX_WORD_LENGTH) return result(word, lang, "unavailable");

	const repo = new DictionaryRepository();

	try {
		const cached = await repo.get(lang, word);
		if (cached?.status === "ready") {
			const payload = cached.payload ?? null;
			const empty = !payload || payload.entries.length === 0;
			return result(word, lang, empty ? "notFound" : "ready", empty ? null : payload);
		}

		await repo.reclaimStale(STALE_FETCH_MS);
		await repo.ensureRow(lang, word);

		if (!(await repo.claimForFetch(lang, word))) {
			// Another request is already fetching this word — report progress rather
			// than duplicating the outbound call. The client polls.
			const current = await repo.get(lang, word);
			if (current?.status === "ready") {
				const payload = current.payload ?? null;
				const empty = !payload || payload.entries.length === 0;
				return result(word, lang, empty ? "notFound" : "ready", empty ? null : payload);
			}
			return result(word, lang, "pending");
		}

		const payload = await repo.fetchUpstream(lang, word);
		await repo.markReady(lang, word, payload);

		return payload.entries.length === 0
			? result(word, lang, "notFound")
			: result(word, lang, "ready", payload);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		log.warn({ lang, word, err: message }, "dictionary lookup failed");
		try {
			await repo.markFailed(lang, word, message);
		} catch {
			/* the lookup already failed; a bookkeeping failure must not mask it */
		}
		return result(word, lang, "unavailable");
	}
}
