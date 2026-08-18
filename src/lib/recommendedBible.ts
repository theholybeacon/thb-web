import { languageNameToIso } from "@/lib/bibleLanguage";

/**
 * The one translation we recommend per language.
 *
 * The catalogue holds ~404 rows and api.bible lists the same translation once
 * per canon, so an English reader was previously offered 36 near-identical
 * choices — four of them literally "World English Bible". A reader starting a
 * study cannot evaluate that list, so we pick for them.
 *
 * Every entry must be:
 *   - audio-licensed (see src/lib/bibleLicense.ts — the recommendation claims
 *     "listenable", so a copyrighted text is disqualified outright)
 *   - a recognised, trustworthy edition rather than merely a permissive one
 *   - the best original-language support available in that language
 *
 * Pinned by SLUG, not version code. `version` is not unique — the catalogue
 * carries kjv-en/kjv-en-2 and web-en..web-en-4 — and `bibleGetByVersionSS`'s
 * version fallback resolves duplicates arbitrarily, so a version-keyed
 * recommendation would be non-deterministic.
 */

/**
 * How much original-language support the reader actually gets. Recorded here so
 * the UI can be honest about the difference without a second lookup.
 *
 * exact    — editorial word-level alignment for this very translation
 * inferred — no alignment exists in this language at any price; the original
 *            word is inferred by a model from the verse's known Greek/Hebrew.
 *            A good guess, not scholarship — label it as such wherever shown.
 */
export type RecommendedAlignment = "exact" | "inferred";

export interface RecommendedBible {
	/** ISO 639-1, matching both the UI locale and `languageNameToIso(bible.language)`. */
	lang: string;
	slug: string;
	version: string;
	label: string;
	/** One line on why this edition, surfaced in the picker. */
	why: string;
	features: { audio: boolean; alignment: RecommendedAlignment };
}

export const RECOMMENDED_BIBLES: RecommendedBible[] = [
	{
		lang: "en",
		slug: "bsb-en",
		version: "BSB",
		label: "Berean Standard Bible",
		why: "Modern, accurate, and released to the public domain (CC0).",
		features: { audio: true, alignment: "exact" },
	},
	{
		lang: "es",
		slug: "rvr09-sp",
		version: "RVR09",
		label: "Reina-Valera 1909",
		why: "The classic Spanish Bible, and the only Reina-Valera in the public domain.",
		features: { audio: true, alignment: "inferred" },
	},
	{
		lang: "fr",
		slug: "jnd-fr",
		version: "JND",
		label: "Bible J.N. Darby",
		why: "A rigorously literal French translation, public domain.",
		features: { audio: true, alignment: "exact" },
	},
	{
		lang: "de",
		slug: "l1912-ge",
		version: "L1912",
		label: "Luther Bibel 1912",
		why: "Luther's text in its public-domain 1912 revision, tagged with Strong's numbers.",
		features: { audio: true, alignment: "exact" },
	},
	{
		lang: "pt",
		slug: "blt-po",
		version: "BLT",
		label: "Bíblia Livre Para Todos",
		why: "A freely licensed modern Portuguese translation.",
		features: { audio: true, alignment: "inferred" },
	},
	{
		lang: "it",
		slug: "db1885-it",
		version: "DB1885",
		label: "Diodati 1885",
		why: "The standard Italian Protestant Bible, public domain.",
		features: { audio: true, alignment: "inferred" },
	},
];

/** The default when we cannot tell what the reader speaks. */
export const FALLBACK_RECOMMENDED_SLUG = "bsb-en";

export function recommendedForLanguageCode(lang?: string | null): RecommendedBible | undefined {
	if (!lang) return undefined;
	const needle = lang.trim().toLowerCase().split("-")[0];
	return RECOMMENDED_BIBLES.find((r) => r.lang === needle);
}

/** Accepts the free-form api.bible language name, e.g. "German, Standard". */
export function recommendedForLanguageName(name?: string | null): RecommendedBible | undefined {
	return recommendedForLanguageCode(languageNameToIso(name));
}

export function recommendedBySlug(slug?: string | null): RecommendedBible | undefined {
	if (!slug) return undefined;
	return RECOMMENDED_BIBLES.find((r) => r.slug === slug);
}

export function isRecommended(slug?: string | null): boolean {
	return recommendedBySlug(slug) !== undefined;
}

/** Slug to use for a locale, always resolving to something readable. */
export function recommendedSlugForLocale(locale?: string | null): string {
	return recommendedForLanguageCode(locale)?.slug ?? FALLBACK_RECOMMENDED_SLUG;
}

export const RECOMMENDED_SLUGS: readonly string[] = RECOMMENDED_BIBLES.map((r) => r.slug);
