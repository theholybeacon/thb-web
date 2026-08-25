import { describe, expect, it } from "vitest";
import type { AudioSegment } from "@/app/common/audio/model/AudioAsset";
import { windowSegments } from "./narrationWindow";

/** A chapter narration: a heading clip, then three verse clips, back to back. */
const CHAPTER: AudioSegment[] = [
	{ kind: "heading", verseNumber: null, startMs: 0, endMs: 1_000, text: "Psalm 117" },
	{ kind: "verse", verseNumber: 1, startMs: 1_000, endMs: 5_500, text: "Praise the LORD..." },
	{ kind: "verse", verseNumber: 2, startMs: 5_500, endMs: 9_250, text: "For his mercy..." },
	{ kind: "verse", verseNumber: 3, startMs: 9_250, endMs: 12_000, text: "Praise ye the LORD." },
];

describe("windowSegments", () => {
	it("returns the whole asset when no verse range is requested", () => {
		const w = windowSegments(CHAPTER, null, null);
		expect(w.segments).toHaveLength(4);
		expect(w.startMs).toBe(0);
		expect(w.endMs).toBe(12_000);
	});

	it("selects a single verse and reports its window in the chapter file", () => {
		const w = windowSegments(CHAPTER, 2, 2);
		expect(w.segments).toHaveLength(1);
		expect(w.startMs).toBe(5_500);
		expect(w.endMs).toBe(9_250);
	});

	it("rebases the passage to its own zero-based timeline", () => {
		// This is the whole point for an animator: absolute offsets seek inside
		// the chapter MP3, relative offsets lay the passage out on its own.
		const w = windowSegments(CHAPTER, 2, 3);
		expect(w.segments.map((s) => s.relativeStartMs)).toEqual([0, 3_750]);
		expect(w.segments.map((s) => s.relativeEndMs)).toEqual([3_750, 6_500]);
		expect(w.segments[0].startMs).toBe(5_500);
	});

	it("reports each segment's own duration", () => {
		const w = windowSegments(CHAPTER, 1, 1);
		expect(w.segments[0].durationMs).toBe(4_500);
	});

	it("excludes non-verse segments from a verse-scoped request", () => {
		// The heading is not verse 1 and must not be narrated as if it were.
		const w = windowSegments(CHAPTER, 1, 1);
		expect(w.segments.every((s) => s.kind === "verse")).toBe(true);
	});

	it("returns an empty window for verses the narration does not contain", () => {
		const w = windowSegments(CHAPTER, 99, 99);
		expect(w.segments).toEqual([]);
		expect(w.startMs).toBe(0);
		expect(w.endMs).toBe(0);
	});

	it("orders output by time even if stored segments are not", () => {
		const shuffled = [CHAPTER[3], CHAPTER[1], CHAPTER[2]];
		const w = windowSegments(shuffled, 1, 3);
		expect(w.segments.map((s) => s.verse)).toEqual([1, 2, 3]);
		expect(w.startMs).toBe(1_000);
	});

	it("treats a null end verse as a single-verse request", () => {
		const w = windowSegments(CHAPTER, 2, null);
		expect(w.segments.map((s) => s.verse)).toEqual([2]);
	});
});
