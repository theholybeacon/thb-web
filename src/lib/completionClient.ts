/**
 * Client-side helpers for the read-completion heuristic.
 *
 * Kept out of the components so the thresholds are stated once and can be
 * reasoned about (and tuned) in a single place.
 */

/**
 * How long a chapter must be actively on screen before reading it counts.
 *
 * Scaled to length, because "I finished this" means something different for
 * Psalm 117 (2 verses) than for Psalm 119 (176). Deliberately lenient — roughly
 * a third of an unhurried reading pace — since this is a sense-of-progress
 * feature, not an exam, and under-counting a real reading is the worse error.
 * The floor stops open-and-bounce from counting; the cap stops the longest
 * chapters from feeling unreachable.
 */
export function requiredDwellSeconds(verseCount: number): number {
	const scaled = 4 + 0.8 * verseCount;
	return Math.round(Math.min(90, Math.max(8, scaled)));
}
