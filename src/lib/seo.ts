/**
 * SEO indexing policy — the single source of truth for "what Google may index".
 *
 * The DB carries ~404 Bible translations. Emitting a sitemap URL for every
 * chapter of every one is ~480,000 near-duplicate pages of the most-duplicated
 * text on the internet — exactly the pattern Google's scaled-content-abuse
 * policy penalizes. So we index only a small, curated core and `noindex`
 * everything else (the pages still work and are readable — they just don't
 * compete for rankings or invite a sitewide penalty).
 *
 * The reader supports ALL translations; this only governs indexing.
 */

import { RECOMMENDED_SLUGS } from "@/lib/recommendedBible";

// One canonical slug per indexed version (the DB has duplicates like
// kjv-en/kjv-en-2 and web-en..web-en-4 — index one each). All are audio-licensed
// (see bibleLicense.ts).
//
// The six recommended translations (src/lib/recommendedBible.ts) are indexed by
// definition: they are what we point readers at, so they are what search should
// find. The extra English entries are kept because they were already indexed and
// carry existing search equity. Note the real slugs are rvr09-sp / blt-po /
// l1912-ge — the suffix follows the api.bible language *name*, not the ISO code.
export const INDEXED_TRANSLATION_SLUGS: ReadonlySet<string> = new Set([
  ...RECOMMENDED_SLUGS, // bsb-en, rvr09-sp, jnd-fr, l1912-ge, blt-po, db1885-it
  "kjv-en", // King James Version
  "web-en", // World English Bible
  "asv-en", // American Standard Version
]);

export function isIndexedTranslation(slug: string | null | undefined): boolean {
  return !!slug && INDEXED_TRANSLATION_SLUGS.has(slug);
}

/**
 * A character page is indexable only once the person has enough scriptural
 * presence to be a substantive, non-thin page. ~260 people clear 10 mentions;
 * the ~2,700-person tail is noindex until it earns a reason to exist.
 */
export const CHARACTER_INDEX_MIN_MENTIONS = 10;
