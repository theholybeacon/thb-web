/**
 * The order `scripts/warm-bible-text.ts` fills translations in.
 *
 * WHY THIS EXISTS: the nightly quota burner (.github/workflows/warm-quota.yml)
 * spends whatever is left of api.bible's daily allowance and is then cut off
 * mid-worklist, every night. Which translations got warmed is therefore decided
 * entirely by this order — an alphabetical worklist would leave the Spanish
 * recommendation cold for months while `asv-en` filled up first.
 *
 * So: the one translation we recommend per language comes first, in the order
 * those languages matter to us, and the extra indexed English editions bring up
 * the rear.
 *
 * Derived from `RECOMMENDED_BIBLES` and `INDEXED_TRANSLATION_SLUGS` rather than
 * being a third hand-maintained list, so a new recommendation cannot be
 * silently omitted from the warm. See src/lib/warmPriority.test.ts.
 */
import { INDEXED_TRANSLATION_SLUGS } from "@/lib/seo";
import { isRecommended, recommendedForLanguageCode } from "@/lib/recommendedBible";

/**
 * Recommended bibles are warmed in this language order.
 *
 * Deliberately NOT the order of `RECOMMENDED_BIBLES` itself: that array's order
 * is the render order of the bible pickers (src/app/bible/components/BibleSelector.tsx,
 * src/components/app/BibleSelector.tsx), so reordering it to change the warm
 * would silently reshuffle the UI.
 *
 * Every recommended language must appear here — the test enforces it, which is
 * what makes the non-null assertion below safe.
 */
export const RECOMMENDED_LANG_ORDER = ["en", "es", "it", "fr", "de", "pt"] as const;

/**
 * bsb-en, rvr09-sp, db1885-it, jnd-fr, l1912-ge, blt-po, then kjv-en, web-en, asv-en.
 *
 * Same SET as `INDEXED_TRANSLATION_SLUGS` — only the order differs.
 */
export const WARM_PRIORITY_SLUGS: readonly string[] = [
	...RECOMMENDED_LANG_ORDER.map((lang) => recommendedForLanguageCode(lang)!.slug),
	...[...INDEXED_TRANSLATION_SLUGS].filter((slug) => !isRecommended(slug)),
];
