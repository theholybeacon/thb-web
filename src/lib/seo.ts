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

// One canonical slug per flagship public-domain English version (the DB has
// duplicates like kjv-en/kjv-en-2 and web-en..web-en-4 — index one each).
// All four are also audio-licensed (see bibleLicense.ts). Edit freely; add
// Spanish public-domain slugs (rvr09-es, vbl-es) when ES indexing goes live.
export const INDEXED_TRANSLATION_SLUGS: ReadonlySet<string> = new Set([
  "kjv-en", // King James Version
  "web-en", // World English Bible
  "asv-en", // American Standard Version
  "bsb-en", // Berean Standard Bible
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
