import { logger } from "@/app/utils/logger";
import type {
	DictionaryPayload,
	DictionaryPosEntry,
	DictionarySense,
} from "../model/Dictionary";

const log = logger.child({ module: "DictionaryFreeApiDao" });

const BASE_URL = "https://freedictionaryapi.com/api/v1/entries";
const TIMEOUT_MS = 8000;
/**
 * Wiktionary is exhaustive in a way a reading panel is not: "love" carries 15+
 * senses across noun and verb, which buries the original-language block below
 * the fold and surfaces euphemistic senses nobody wants beside scripture.
 * Wiktionary orders senses by primacy, so the first few are the useful ones and
 * `sourceUrl` covers anyone who wants the full entry.
 */
const MAX_POS_ENTRIES = 3;
const MAX_SENSES_PER_POS = 4;

/** The subset of the upstream response we rely on. */
interface UpstreamResponse {
	word?: string;
	entries?: {
		language?: { code?: string; name?: string };
		partOfSpeech?: string;
		pronunciations?: { type?: string; text?: string; tags?: string[] }[];
		forms?: { word?: string; tags?: string[] }[];
		senses?: {
			definition?: string;
			tags?: string[];
			examples?: string[];
			synonyms?: string[];
			antonyms?: string[];
		}[];
	}[];
	source?: { url?: string; license?: { name?: string; url?: string } };
}

/**
 * Wiktionary-derived definitions via freedictionaryapi.com.
 *
 * No API key; the limit is 1000 requests/hour per IP, which on Vercel is shared
 * by every user — hence the DB cache in front of this. Data is CC BY-SA 4.0, so
 * `sourceUrl` must survive into the payload and be rendered (see the panel's
 * attribution footer).
 *
 * A word that does not exist comes back as HTTP 200 with `entries: []`, NOT a
 * 404. Callers must treat an empty payload as a valid, cacheable answer.
 */
export class DictionaryFreeApiDao {

	async lookup(lang: string, word: string): Promise<DictionaryPayload> {
		log.trace("lookup");

		const url = `${BASE_URL}/${encodeURIComponent(lang)}/${encodeURIComponent(word)}`;
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

		let response: Response;
		try {
			response = await fetch(url, {
				signal: controller.signal,
				headers: { accept: "application/json" },
			});
		} finally {
			clearTimeout(timeout);
		}

		if (response.status === 429) throw new Error("DICTIONARY_RATE_LIMITED");
		if (!response.ok) throw new Error(`DICTIONARY_UPSTREAM_${response.status}`);

		const body = (await response.json()) as UpstreamResponse;
		return this.normalize(lang, word, body);
	}

	/**
	 * Flattens upstream into our stored shape and drops entries for other
	 * languages — `entries` can carry homographs from several languages even when
	 * one was requested, and showing a Latin sense under a Spanish verse is worse
	 * than showing nothing.
	 */
	private normalize(lang: string, word: string, body: UpstreamResponse): DictionaryPayload {
		const entries: DictionaryPosEntry[] = [];

		for (const entry of body.entries ?? []) {
			if (entry.language?.code && entry.language.code !== lang) continue;

			const senses: DictionarySense[] = [];
			for (const sense of entry.senses ?? []) {
				const definition = sense.definition?.trim();
				if (!definition) continue;
				senses.push({
					definition,
					tags: sense.tags ?? [],
					examples: (sense.examples ?? []).filter(Boolean),
					synonyms: (sense.synonyms ?? []).filter(Boolean),
					antonyms: (sense.antonyms ?? []).filter(Boolean),
				});
				if (senses.length >= MAX_SENSES_PER_POS) break;
			}
			if (senses.length === 0) continue;

			entries.push({
				partOfSpeech: entry.partOfSpeech ?? "",
				pronunciations: (entry.pronunciations ?? [])
					.filter((p) => p.text)
					.map((p) => ({ type: p.type ?? "ipa", text: p.text!, tags: p.tags ?? [] })),
				forms: (entry.forms ?? [])
					.filter((f) => f.word)
					.map((f) => ({ word: f.word!, tags: f.tags ?? [] })),
				senses,
			});
			if (entries.length >= MAX_POS_ENTRIES) break;
		}

		return {
			word: body.word ?? word,
			entries,
			sourceUrl: body.source?.url ?? null,
			license: body.source?.license?.name
				? { name: body.source.license.name, url: body.source.license.url ?? "" }
				: null,
		};
	}
}
