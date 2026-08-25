import { describe, expect, it } from "vitest";
import {
	MAX_RANGE_VERSES,
	ReferenceParseError,
	canonicalReference,
	formatReference,
	knownBookKeys,
	parseReference,
} from "./reference";

/** Asserts a parse fails, and fails for the stated reason. */
function expectCode(raw: string, code: string) {
	try {
		parseReference(raw);
		throw new Error(`Expected "${raw}" to be rejected, but it parsed.`);
	} catch (err) {
		expect(err).toBeInstanceOf(ReferenceParseError);
		expect((err as ReferenceParseError).code).toBe(code);
	}
}

describe("parseReference", () => {
	it("parses a single verse", () => {
		const ref = parseReference("john-3-16");
		expect(ref.usfm).toBe("JHN");
		expect(ref.chapter).toBe(3);
		expect(ref.startVerse).toBe(16);
		// A single verse reports an inclusive range of itself, so callers never
		// have to special-case a null end.
		expect(ref.endVerse).toBe(16);
	});

	it("parses a verse range", () => {
		const ref = parseReference("john-3-16-18");
		expect(canonicalReference(ref)).toBe("JHN 3:16-18");
	});

	it("parses a whole chapter", () => {
		const ref = parseReference("psa-117");
		expect(ref.startVerse).toBeNull();
		expect(ref.endVerse).toBeNull();
		expect(canonicalReference(ref)).toBe("PSA 117");
	});

	it("accepts USFM dot notation, matching how citations are written elsewhere", () => {
		expect(canonicalReference(parseReference("JHN.3.16"))).toBe("JHN 3:16");
	});

	it("handles numbered books", () => {
		expect(canonicalReference(parseReference("1co-13-4-7"))).toBe("1CO 13:4-7");
		expect(canonicalReference(parseReference("2-samuel-7-12"))).toBe("2SA 7:12");
		expect(canonicalReference(parseReference("1-john-4-8"))).toBe("1JN 4:8");
	});

	it("takes the longest matching book name", () => {
		// "song" alone is a valid alias, so a shorter greedy match would strand
		// "of-solomon" and misparse the numbers.
		expect(canonicalReference(parseReference("song-of-solomon-1-1"))).toBe("SNG 1:1");
	});

	it("is case- and separator-insensitive", () => {
		const forms = ["JOHN-3-16", "John.3.16", "john_3_16", "jhn-3-16"];
		for (const form of forms) {
			expect(canonicalReference(parseReference(form))).toBe("JHN 3:16");
		}
	});

	it("accepts common alternative spellings", () => {
		expect(parseReference("psalms-23").usfm).toBe("PSA");
		expect(parseReference("psalm-23").usfm).toBe("PSA");
		expect(parseReference("revelations-21-1").usfm).toBe("REV");
		expect(parseReference("philippians-4-13").usfm).toBe("PHP");
	});

	it("formats for display", () => {
		expect(formatReference(parseReference("john-3-16"))).toBe("John 3:16");
		expect(formatReference(parseReference("john-3-16-18"))).toBe("John 3:16-18");
		expect(formatReference(parseReference("psa-117"))).toBe("Psalms 117");
	});

	it("rejects an unknown book rather than guessing", () => {
		expectCode("nope-1-1", "UNKNOWN_BOOK");
		// Deuterocanonical books are outside the 66-book canon the app measures against.
		expectCode("tobit-1-1", "UNKNOWN_BOOK");
	});

	it("rejects a chapter beyond the book's real length", () => {
		expectCode("john-99-1", "CHAPTER_OUT_OF_RANGE");
		expectCode("obadiah-2-1", "CHAPTER_OUT_OF_RANGE");
	});

	it("rejects a descending range", () => {
		expectCode("john-3-18-16", "INVALID_VERSE_RANGE");
	});

	it("caps range size so this stays a passage API, not a bulk export", () => {
		const atLimit = parseReference(`psa-119-1-${MAX_RANGE_VERSES}`);
		expect(atLimit.endVerse).toBe(MAX_RANGE_VERSES);
		expectCode(`psa-119-1-${MAX_RANGE_VERSES + 1}`, "RANGE_TOO_LARGE");
	});

	it("rejects malformed input", () => {
		expectCode("", "INVALID_REFERENCE");
		expectCode("john", "INVALID_REFERENCE");
		expectCode("john-3-16-18-20", "INVALID_REFERENCE");
		expectCode("john-three-16", "INVALID_REFERENCE");
	});

	it("exposes every accepted book key for the docs", () => {
		const keys = knownBookKeys();
		expect(keys).toContain("jhn");
		expect(keys).toContain("john");
		expect(keys).toContain("song-of-solomon");
		// 66 USFM codes at minimum, plus names and aliases.
		expect(keys.length).toBeGreaterThan(66);
	});
});
