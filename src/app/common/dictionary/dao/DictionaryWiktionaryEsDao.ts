import { logger } from "@/app/utils/logger";
import type { DictionaryPayload } from "../model/Dictionary";
import { parseEsWiktionary } from "./parseEsWiktionary";

const log = logger.child({ module: "DictionaryWiktionaryEsDao" });

const API_URL = "https://es.wiktionary.org/w/api.php";
const PAGE_URL = "https://es.wiktionary.org/wiki/";
const TIMEOUT_MS = 8000;
/** Wikimedia blocks requests without a descriptive User-Agent. */
const USER_AGENT = "TheHolyBeacon/1.0 (https://theholybeacon.com; dictionary lookups)";

interface ParseResponse {
	parse?: { title?: string; text?: string };
	error?: { code?: string; info?: string };
}

/**
 * Definitions written in Spanish, from the Spanish Wiktionary.
 *
 * freedictionaryapi.com only reads the English Wiktionary, so every word it
 * returns is defined in English — "amor" comes back as "love". es.wiktionary
 * defines words of every language in Spanish, so this serves a Spanish reader
 * whatever the Bible's language.
 *
 * Content is CC BY-SA 4.0, like the English provider: `sourceUrl` must reach the
 * panel's attribution footer.
 */
export class DictionaryWiktionaryEsDao {

	async lookup(wordLang: string, word: string): Promise<DictionaryPayload> {
		log.trace("lookup");

		// Page titles are case-sensitive and the lookup key is lowercased, so a
		// proper noun ("Jehová", "Dios") is only found on the second try.
		const candidates = [word, word.charAt(0).toUpperCase() + word.slice(1)];
		for (const title of new Set(candidates)) {
			const page = await this.fetchPage(title);
			if (!page) continue;
			const { entries } = parseEsWiktionary(page.html, wordLang);
			if (entries.length === 0) continue;
			return {
				word: page.title,
				entries,
				sourceUrl: PAGE_URL + encodeURIComponent(page.title.replace(/ /g, "_")),
				license: { name: "CC BY-SA 4.0", url: "https://creativecommons.org/licenses/by-sa/4.0/" },
			};
		}

		return { word, entries: [], sourceUrl: null, license: null };
	}

	/** The rendered page, or null when it does not exist. */
	private async fetchPage(title: string): Promise<{ title: string; html: string } | null> {
		const params = new URLSearchParams({
			action: "parse",
			page: title,
			prop: "text",
			redirects: "1",
			disableeditsection: "1",
			disabletoc: "1",
			format: "json",
			formatversion: "2",
		});

		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
		let response: Response;
		try {
			response = await fetch(`${API_URL}?${params}`, {
				signal: controller.signal,
				headers: { accept: "application/json", "user-agent": USER_AGENT },
			});
		} finally {
			clearTimeout(timeout);
		}

		if (response.status === 429) throw new Error("DICTIONARY_RATE_LIMITED");
		if (!response.ok) throw new Error(`DICTIONARY_UPSTREAM_${response.status}`);

		const body = (await response.json()) as ParseResponse;
		if (body.error?.code === "missingtitle" || body.error?.code === "invalidtitle") return null;
		if (body.error) throw new Error(`DICTIONARY_UPSTREAM_${body.error.code ?? "error"}`);
		if (!body.parse?.text) return null;
		return { title: body.parse.title ?? title, html: body.parse.text };
	}
}
