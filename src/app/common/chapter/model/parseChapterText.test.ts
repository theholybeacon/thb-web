import { describe, expect, it } from "vitest";
import { parseChapterText } from "./parseChapterText";

describe("parseChapterText", () => {
	it("returns [] when the payload carries no markers", () => {
		expect(parseChapterText("")).toEqual([]);
		expect(parseChapterText("In the beginning God created")).toEqual([]);
	});

	it("splits on bracketed markers and drops the single separator space", () => {
		const parsed = parseChapterText("[1] In the beginning\n[2] And the earth");
		expect(parsed).toEqual([
			{ verseNumber: 1, content: "In the beginning\n" },
			{ verseNumber: 2, content: "And the earth" },
		]);
	});

	it("rejoins a verse marked twice across a paragraph break", () => {
		const parsed = parseChapterText("[1] first half\n[1] second half\n[2] next");
		expect(parsed.map((v) => v.verseNumber)).toEqual([1, 2]);
		expect(parsed[0].content).toBe("first half\nsecond half\n");
	});

	it("ignores a bracketed number in prose that would rewind the count", () => {
		const parsed = parseChapterText("[5] see [2] above\n[6] next");
		expect(parsed.map((v) => v.verseNumber)).toEqual([5, 6]);
		expect(parsed[0].content).toBe("see [2] above\n");
	});

	// BSB Zechariah 12: `include-titles=false` strips verse 1's marker along with
	// its USFM descriptive title, so the payload opens at [2] with verse 1's prose
	// sitting unmarked in front of it.
	it("recovers an unmarked verse 1 when the first marker is [2]", () => {
		const parsed = parseChapterText(
			"    \nThus declares the LORD:\n    \n [2] Behold, I will make Jerusalem\n [3] On that day",
		);
		expect(parsed.map((v) => v.verseNumber)).toEqual([1, 2, 3]);
		expect(parsed[0].content).toBe("Thus declares the LORD:\n    \n");
		expect(parsed[1].content).toBe(" Behold, I will make Jerusalem\n");
	});

	it("keeps the leading indent of a recovered verse 1", () => {
		const parsed = parseChapterText("  \n  Blessed is the man\n [2] but the wicked");
		expect(parsed[0]).toEqual({ verseNumber: 1, content: "  Blessed is the man\n" });
	});

	it("does not invent a verse 1 when the leading text is only formatting", () => {
		const parsed = parseChapterText("    \n [2] Behold\n [3] On that day");
		expect(parsed.map((v) => v.verseNumber)).toEqual([2, 3]);
	});

	it("does not guess when the first marker is past [2]", () => {
		const parsed = parseChapterText("some orphaned prose\n [4] fourth\n [5] fifth");
		expect(parsed.map((v) => v.verseNumber)).toEqual([4, 5]);
	});

	it("drops a marker with no content — the omitted-verse case", () => {
		const parsed = parseChapterText("[20] real text\n[21]\n[22] more text");
		expect(parsed.map((v) => v.verseNumber)).toEqual([20, 22]);
	});
});
