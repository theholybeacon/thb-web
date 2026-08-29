import { describe, expect, it } from "vitest";
import { RECOMMENDED_LANG_ORDER, WARM_PRIORITY_SLUGS } from "./warmPriority";
import { RECOMMENDED_BIBLES, isRecommended } from "./recommendedBible";
import { INDEXED_TRANSLATION_SLUGS } from "./seo";

describe("WARM_PRIORITY_SLUGS", () => {
	it("covers every recommended language", () => {
		// A seventh recommendation added without a line in RECOMMENDED_LANG_ORDER
		// would be dropped from the nightly warm entirely, and the non-null
		// assertion in warmPriority.ts would throw at import time.
		expect([...RECOMMENDED_LANG_ORDER].sort()).toEqual(RECOMMENDED_BIBLES.map((r) => r.lang).sort());
	});

	it("is INDEXED_TRANSLATION_SLUGS reordered, nothing added or dropped", () => {
		// The warm must never spend quota on a translation we do not index, nor
		// leave an indexed one permanently cold.
		expect(new Set(WARM_PRIORITY_SLUGS)).toEqual(new Set(INDEXED_TRANSLATION_SLUGS));
		expect(WARM_PRIORITY_SLUGS).toHaveLength(INDEXED_TRANSLATION_SLUGS.size);
	});

	it("has no duplicates", () => {
		// A duplicated slug would make array_position ambiguous in the worklist.
		expect(new Set(WARM_PRIORITY_SLUGS).size).toBe(WARM_PRIORITY_SLUGS.length);
	});

	it("leads with the recommended bibles in language order", () => {
		expect(WARM_PRIORITY_SLUGS.slice(0, RECOMMENDED_LANG_ORDER.length)).toEqual([
			"bsb-en",
			"rvr09-sp",
			"db1885-it",
			"jnd-fr",
			"l1912-ge",
			"blt-po",
		]);
	});

	it("puts every non-recommended translation after every recommended one", () => {
		const firstExtra = WARM_PRIORITY_SLUGS.findIndex((slug) => !isRecommended(slug));
		expect(WARM_PRIORITY_SLUGS.slice(firstExtra).every((slug) => !isRecommended(slug))).toBe(true);
	});
});
