import { createHash } from "crypto";

/**
 * A stable fingerprint of a chapter's text, used to share one narration across
 * every Bible row that carries the same words.
 *
 * API.Bible lists a translation once per canon, and those rows hold identical
 * text for the books they share. Hashing the text lets identical chapters
 * collapse onto one audio asset without trusting the edition labels — which are
 * demonstrably unreliable (WEBUS Orthodox carries WEB's John 3, not its own
 * siblings').
 *
 * Two deliberate choices:
 *  - Whitespace is normalized, so trivial formatting differences don't fragment
 *    the cache. The ORIGINAL text is still what gets sent to TTS.
 *  - Verse NUMBERS are part of the hash. Two chapters with identical prose but
 *    different verse divisions must not share an asset — the segment offsets
 *    that drive verse highlighting and seek-to-verse would be wrong.
 */
export function chapterContentHash(
	verses: { verseNumber: number; content: string }[]
): string {
	const payload = [...verses]
		.sort((a, b) => a.verseNumber - b.verseNumber)
		.map((v) => `${v.verseNumber}:${normalize(v.content)}`)
		.join("\n");

	return createHash("sha256").update(payload, "utf8").digest("hex");
}

function normalize(text: string): string {
	return text.replace(/\s+/g, " ").trim();
}
