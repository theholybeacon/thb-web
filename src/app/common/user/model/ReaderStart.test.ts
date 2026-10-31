import { describe, expect, it } from "vitest";
import { describeReaderStart, NOTE_MAX, parseReaderStart } from "./ReaderStart";

describe("parseReaderStart", () => {
	it("keeps a complete set of answers", () => {
		expect(parseReaderStart({ familiarity: "some", depth: "deep", interests: ["prayer", "people"], note: "  Why does God allow suffering? ", time: "long" })).toEqual({
			familiarity: "some",
			depth: "deep",
			interests: ["prayer", "people"],
			note: "Why does God allow suffering?",
			time: "long",
		});
	});

	it("drops what it does not know and refuses an incomplete set", () => {
		const parsed = parseReaderStart({ familiarity: "new", depth: "light", interests: ["jesus", "astrology", "jesus", 4], note: "x".repeat(NOTE_MAX + 50), time: "minutes" });
		expect(parsed?.interests).toEqual(["jesus"]);
		expect(parsed?.note).toHaveLength(NOTE_MAX);
		expect(parseReaderStart({ familiarity: "new", depth: "light" })).toBeNull();
		expect(parseReaderStart({ familiarity: "expert", depth: "light", time: "minutes" })).toBeNull();
		expect(parseReaderStart(null)).toBeNull();
		expect(parseReaderStart("new")).toBeNull();
	});

	it("reads as plain lines for the study builder", () => {
		const lines = describeReaderStart({ familiarity: "regular", depth: "steady", interests: [], note: "", time: "quarter" });
		expect(lines.join("\n")).toContain("reads the Bible regularly");
		expect(lines.join("\n")).toContain("about 15 minutes a day");
		expect(lines.join("\n")).toContain("did not pick a topic");
	});
});
