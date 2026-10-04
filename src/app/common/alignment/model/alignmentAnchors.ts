/**
 * Hand-verified anchors, checked after every import.
 *
 * A source can be perfectly licensed, parse cleanly and report "100% tagged"
 * while its Strong's numbers sit on the wrong words — CrossWire's ASV attaches
 * G3004 (λέγω, "saith") to "to" and leaves "lovest thou" unwrapped. Nothing
 * mechanical caught that; only reading the output did. So every source must
 * assert a few known word→Strong's pairs, and adding a source means adding its
 * anchors here first.
 *
 * Keep these to unambiguous cases: proper nouns, and the ἀγαπάω/φιλέω contrast
 * in John 21 that the whole feature exists to surface.
 */
export const ALIGNMENT_ANCHORS: Record<string, { ref: [string, number, number]; surface: string; strongs: string }[]> = {
	bsb: [
		{ ref: ["JHN", 21, 15], surface: "do you love", strongs: "G0025" },
		{ ref: ["JHN", 21, 17], surface: "do you love", strongs: "G5368" },
		{ ref: ["GEN", 1, 1], surface: "god", strongs: "H0430" },
	],
	frejnd: [
		{ ref: ["JHN", 21, 15], surface: "aimes", strongs: "G0025" },
		{ ref: ["JHN", 21, 17], surface: "aimes", strongs: "G5368" },
		{ ref: ["GEN", 1, 1], surface: "dieu", strongs: "H0430" },
	],
	// Fetched live from api.bible rather than seeded from JSONL, so it is loaded
	// a chapter at a time and only the chapters readers have opened exist. The
	// anchors therefore stay inside John 21 — a Genesis anchor would fail merely
	// because nobody had read Genesis yet. Verify with:
	//   npm run seed:alignment -- --verify-only l1912
	l1912: [
		{ ref: ["JHN", 21, 15], surface: "lieber", strongs: "G0025" },
		{ ref: ["JHN", 21, 15], surface: "liebhabe", strongs: "G5368" },
		{ ref: ["JHN", 21, 17], surface: "lieb", strongs: "G5368" },
	],
};
