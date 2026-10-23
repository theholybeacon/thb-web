import { GlobalStudyDef } from "./globalStudy";
import { CHRONOLOGICAL_PLAN } from "./plans/chronological";
import { COVER_TO_COVER_PLAN } from "./plans/coverToCover";
import { STORIES } from "./stories";

/**
 * Every plan and story offered in the global catalog, in display order.
 *
 * Adding a plan is: write the definition under ./plans, list it here, and run
 * `npm run seed:studies`. The seed is keyed on `slug`, so re-running it updates
 * the existing rows rather than creating second copies.
 */
export const GLOBAL_STUDIES: GlobalStudyDef[] = [
	CHRONOLOGICAL_PLAN,
	COVER_TO_COVER_PLAN,
	// Stories are listed in ./stories/index.ts.
	...STORIES,
];

export function globalStudyDef(slug: string): GlobalStudyDef | undefined {
	return GLOBAL_STUDIES.find((s) => s.slug === slug);
}
