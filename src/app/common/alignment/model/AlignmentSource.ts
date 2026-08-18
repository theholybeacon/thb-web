/**
 * The registry of original-language alignment sources.
 *
 * Alignment is per-translation editorial data: a human mapped each rendered
 * word back to the Greek/Hebrew word it renders. It does not transfer between
 * translations, so no single source can cover the catalogue. This registry is
 * what turns "no data for this translation" into a resolution order instead of
 * a dead end — see `alignmentLookupSS` for the three tiers.
 *
 * Sources are matched on `bible.version` (case-insensitively), not on slug:
 * the catalogue holds duplicate rows per translation (kjv-en, kjv-en-2,
 * web-en..web-en-4) and the slug suffix follows the language *name*, giving
 * rvr09-sp and blt-po rather than the ISO-style forms. This mirrors how
 * bibleLicense.ts already matches.
 *
 * LICENSING IS LOAD-BEARING HERE. Only add a source whose licence permits
 * commercial redistribution. Verified during research and deliberately excluded:
 *   - SWORD `KJV`      GPL.
 *   - `SpaRV1909`      "Permission to distribute granted to CrossWire" — that
 *                      grant is to CrossWire, not to us. Spanish therefore has
 *                      no tier-1 source and runs on tier 3.
 *   - German modules   BY-NC-ND / non-commercial only.
 *   - `SpaRV`          advertises Feature=StrongsNumbers in its .conf but ships
 *                      with no Strong's markup whatsoever. Never trust the conf.
 *
 * Excluded for DATA QUALITY, which licence checks will not catch:
 *   - `ASV`            fully licence-clean (public domain) and 100% "tagged",
 *                      but its tags are offset by one or two words. In John
 *                      21:15 "lovest thou" is unwrapped entirely while "to"
 *                      carries G3004 (λέγω, "saith") and "of" carries G2962
 *                      (κύριος, "Lord"). A source that answers confidently and
 *                      wrongly is worse than tier 3, which at least says what it
 *                      does not know. Any new source must pass the anchor
 *                      fixture in scripts/import-alignment.ts before shipping.
 * Portuguese and Italian have no aligned source in existence at all.
 */

export type AlignmentLicenseKind = "cc0" | "public-domain" | "cc-by" | "cc-by-sa";

export interface AlignmentSource {
	/** Stable key stored in `alignment_word.sourceCode`. */
	code: string;
	label: string;
	/** ISO 639-1 code of the translation's own language. */
	lang: string;
	/** Matched case-insensitively against `bible.version`. */
	versions: string[];
	license: { kind: AlignmentLicenseKind; label: string };
	/** Shown wherever this source's data is rendered. */
	attribution: string;
	/**
	 * Where the words come from.
	 *
	 * `sword`/`usfm3` are offline corpora extracted once and served from Blob.
	 * `apibible` is fetched live from the same API that serves the reader's text,
	 * so it needs no corpus at all — api.bible ships `data-strong` markup inline
	 * when a chapter is requested with `content-type=html`.
	 */
	origin:
		| { kind: "sword"; module: string }
		| { kind: "usfm3"; repo: string }
		| { kind: "apibible"; bibleApiId: string };
}

export const ALIGNMENT_SOURCES: AlignmentSource[] = [
	{
		code: "bsb",
		label: "Berean Standard Bible",
		lang: "en",
		versions: ["BSB"],
		license: { kind: "cc0", label: "CC0 1.0" },
		attribution: "Berean Standard Bible (CC0) — berean.bible",
		origin: { kind: "sword", module: "BSB" },
	},
	{
		code: "l1912",
		label: "Luther Bibel 1912",
		lang: "de",
		versions: ["L1912"],
		license: { kind: "public-domain", label: "Public Domain" },
		attribution: "Luther Bibel 1912, public domain — Strong's tagging via API.Bible",
		// api.bible serves this edition with inline data-strong markup, already
		// zero-padded to our canonical form. Spot-checked on John 21: "lieber" ->
		// G0025 agapao in v15, all phileo in v17 — it preserves the contrast the
		// CrossWire ASV mangled, which is why that module is excluded and this is not.
		origin: { kind: "apibible", bibleApiId: "926aa5efbc5e04e2-01" },
	},
	{
		code: "frejnd",
		label: "Bible J.N. Darby (French)",
		lang: "fr",
		versions: ["JND"],
		license: { kind: "public-domain", label: "Public Domain" },
		attribution: "Bible J.N. Darby, public domain",
		origin: { kind: "sword", module: "FreJND" },
	},
];

/**
 * The source used for tier-3 verse-level lookups, i.e. for every translation
 * and language with no alignment of its own. Must be the most permissively
 * licensed complete source we have, since its data is shown to readers of
 * translations it has nothing to do with.
 */
export const FALLBACK_SOURCE_CODE = "bsb";

export function sourceByCode(code: string): AlignmentSource | undefined {
	return ALIGNMENT_SOURCES.find((s) => s.code === code);
}

/** The source aligned to this exact translation, if one exists (tier 1). */
export function sourceForVersion(version?: string | null): AlignmentSource | undefined {
	if (!version) return undefined;
	const needle = version.trim().toLowerCase();
	return ALIGNMENT_SOURCES.find((s) => s.versions.some((v) => v.toLowerCase() === needle));
}

/** Sources in the same language as the reader's translation (tier 2). */
export function sourcesForLanguage(lang?: string | null): AlignmentSource[] {
	if (!lang) return [];
	return ALIGNMENT_SOURCES.filter((s) => s.lang === lang);
}
