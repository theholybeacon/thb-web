"use server";

import { logger } from "@/app/utils/logger";
import { normalizeWord } from "@/lib/strongs";
import { DictionaryRepository } from "../../repository/DictionaryRepository";
import { defaultDefinitionLanguage, isDefinitionLanguage } from "@/lib/dictionaryLanguage";
import { DictionaryKey, DictionaryLookupResult } from "../../model/Dictionary";

const log = logger.child({ module: "dictionaryLookupSS" });

const STALE_FETCH_MS = 2 * 60 * 1000;
/** Longest thing we will look up. Beyond this it is a sentence, not a word. */
const MAX_WORD_LENGTH = 80;

function result(
	{ word, lang, definitionLang }: DictionaryKey,
	status: DictionaryLookupResult["status"],
	payload: DictionaryLookupResult["payload"] = null,
): DictionaryLookupResult {
	return { word, lang, definitionLang, status, payload };
}

/**
 * Definition for a selected word, cached in Postgres and shared by all readers.
 *
 * `lang` is the word's language (the Bible's); `definitionLang` the language
 * the definition is written in, which defaults to the Bible's own when we have
 * a dictionary for it. Unsupported values fall back rather than fail.
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
	definitionLang?: string | null,
): Promise<DictionaryLookupResult> {
	const key: DictionaryKey = {
		word: normalizeWord(rawWord),
		lang,
		definitionLang: isDefinitionLanguage(definitionLang) ? definitionLang : defaultDefinitionLanguage(lang),
	};

	if (!key.word || !lang) return result(key, "unavailable");
	if (key.word.length > MAX_WORD_LENGTH) return result(key, "unavailable");

	const repo = new DictionaryRepository();

	try {
		const cached = await repo.get(key);
		if (cached?.status === "ready") {
			const payload = cached.payload ?? null;
			const empty = !payload || payload.entries.length === 0;
			return result(key, empty ? "notFound" : "ready", empty ? null : payload);
		}

		await repo.reclaimStale(STALE_FETCH_MS);
		await repo.ensureRow(key);

		if (!(await repo.claimForFetch(key))) {
			// Another request is already fetching this word — report progress rather
			// than duplicating the outbound call. The client polls.
			const current = await repo.get(key);
			if (current?.status === "ready") {
				const payload = current.payload ?? null;
				const empty = !payload || payload.entries.length === 0;
				return result(key, empty ? "notFound" : "ready", empty ? null : payload);
			}
			return result(key, "pending");
		}

		const { payload, source } = await repo.fetchUpstream(key);
		await repo.markReady(key, payload, source);

		return payload.entries.length === 0
			? result(key, "notFound")
			: result(key, "ready", payload);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		log.warn({ ...key, err: message }, "dictionary lookup failed");
		try {
			await repo.markFailed(key, message);
		} catch {
			/* the lookup already failed; a bookkeeping failure must not mask it */
		}
		return result(key, "unavailable");
	}
}
