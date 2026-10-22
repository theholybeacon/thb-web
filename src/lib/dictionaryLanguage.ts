/**
 * Languages a definition can be written in, each backed by a Wiktionary edition
 * that defines words of every language in its own: English via
 * freedictionaryapi.com, Spanish via es.wiktionary.org.
 *
 * The word's language is the Bible's; the definition's language is the reader's
 * choice, defaulting to the Bible's so a Reina-Valera reader gets "amor" defined
 * in Spanish rather than glossed as "love".
 */
export const DEFINITION_LANGUAGES = ["en", "es"] as const;
export type DefinitionLanguage = (typeof DEFINITION_LANGUAGES)[number];

export function isDefinitionLanguage(code: string | null | undefined): code is DefinitionLanguage {
	return !!code && (DEFINITION_LANGUAGES as readonly string[]).includes(code);
}

/** The Bible's own language when we can define in it, English otherwise. */
export function defaultDefinitionLanguage(wordLang: string | null | undefined): DefinitionLanguage {
	return isDefinitionLanguage(wordLang) ? wordLang : "en";
}
