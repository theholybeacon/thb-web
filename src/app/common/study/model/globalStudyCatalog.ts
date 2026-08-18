import { GlobalStudyDef } from "./globalStudy";
import { CHRONOLOGICAL_PLAN } from "./plans/chronological";

/**
 * Every plan offered in the global catalog, in display order.
 *
 * Adding one is: write the definition under ./plans, list it here, and run
 * `npm run seed:studies`. The seed is keyed on `slug`, so re-running it updates
 * the existing rows rather than creating second copies.
 */
export const GLOBAL_STUDIES: GlobalStudyDef[] = [
	CHRONOLOGICAL_PLAN,
];

export function globalStudyDef(slug: string): GlobalStudyDef | undefined {
	return GLOBAL_STUDIES.find((s) => s.slug === slug);
}
