/**
 * `bible.language` holds the free-form language *name* that api.bible reports
 * (`"English"`, `"Spanish"`, `"Portuguese"`), not an ISO code — see
 * BibleExternalAPIDao, which copies `bible.language.name` straight through.
 * Dictionary lookups need a code, so translate here rather than at each call
 * site.
 *
 * Unknown languages return null and the caller degrades: the dictionary section
 * simply doesn't offer a lookup, which is far better than querying the wrong
 * language and rendering confidently wrong definitions.
 */
const NAME_TO_ISO: Record<string, string> = {
	english: "en",
	spanish: "es",
	"español": "es",
	castilian: "es",
	portuguese: "pt",
	"português": "pt",
	french: "fr",
	"français": "fr",
	german: "de",
	deutsch: "de",
	italian: "it",
	italiano: "it",
	dutch: "nl",
	greek: "el",
	"ancient greek": "grc",
	"koine greek": "grc",
	// api.bible inverts the qualifier: "Greek, Ancient". Listed explicitly so the
	// comma-splitting fallback below cannot mistake it for modern Greek.
	"greek, ancient": "grc",
	"hebrew, ancient": "hbo",
	hebrew: "he",
	"ancient hebrew": "hbo",
	latin: "la",
	russian: "ru",
	polish: "pl",
	romanian: "ro",
	swedish: "sv",
	norwegian: "no",
	danish: "da",
	finnish: "fi",
	czech: "cs",
	hungarian: "hu",
	turkish: "tr",
	arabic: "ar",
	hindi: "hi",
	indonesian: "id",
	vietnamese: "vi",
	thai: "th",
	korean: "ko",
	japanese: "ja",
	chinese: "zh",
	tagalog: "tl",
	swahili: "sw",
	ukrainian: "uk",
};

/** ISO 639-1 code for an api.bible language name, or null if unrecognised. */
export function languageNameToIso(name?: string | null): string | null {
	if (!name) return null;

	const key = name.trim().toLowerCase();
	if (NAME_TO_ISO[key]) return NAME_TO_ISO[key];

	// api.bible sometimes qualifies the name — "Spanish; Castilian",
	// "Portuguese (Brazil)". Try the leading term before giving up.
	const head = key.split(/[;(,]/)[0].trim();
	return NAME_TO_ISO[head] ?? null;
}
