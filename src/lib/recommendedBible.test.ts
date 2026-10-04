import { describe, expect, it } from "vitest";
import { RECOMMENDED_BIBLES } from "./recommendedBible";
import { languageNameToIso } from "./bibleLanguage";
import { ALIGNMENT_SOURCES, sourceForVersion } from "@/app/common/alignment/model/AlignmentSource";
import { ALIGNMENT_ANCHORS } from "@/app/common/alignment/model/alignmentAnchors";

/**
 * `bible.language` exactly as api.bible stores it for each recommended slug
 * (captured by `npm run audit:study-links`). If a catalogue refresh changes one
 * of these, the dictionary for that language silently disappears — update the
 * fixture and NAME_TO_ISO together.
 */
const STORED_LANGUAGE_NAME: Record<string, string> = {
	"bsb-en": "English",
	"rvr09-sp": "Spanish",
	"jnd-fr": "French",
	"l1912-ge": "German, Standard",
	"blt-po": "Portuguese",
	"db1885-it": "Italian",
};

describe("RECOMMENDED_BIBLES study links", () => {
	it.each(RECOMMENDED_BIBLES)("$slug: alignment tier matches the source registry", (r) => {
		// The picker promises "exact" alignment; that is only true if a source
		// is registered for this very version.
		const own = sourceForVersion(r.version);
		expect(r.features.alignment === "exact").toBe(Boolean(own));
		if (own) expect(own.lang).toBe(r.lang);
	});

	it.each(RECOMMENDED_BIBLES)("$slug: dictionary language resolves", (r) => {
		const stored = STORED_LANGUAGE_NAME[r.slug];
		expect(stored, `add ${r.slug} to STORED_LANGUAGE_NAME`).toBeDefined();
		expect(languageNameToIso(stored)).toBe(r.lang);
	});

	it("every alignment source has anchors", () => {
		// import-alignment.ts refuses to trust a source without them.
		for (const s of ALIGNMENT_SOURCES) expect(ALIGNMENT_ANCHORS[s.code]?.length ?? 0).toBeGreaterThan(0);
	});
});
