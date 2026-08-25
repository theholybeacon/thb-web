import type { AudioSegment } from "@/app/common/audio/model/AudioAsset";

/**
 * Slices a chapter narration's verse segments down to a requested passage.
 *
 * Narration is ONE MP3 per chapter, so a passage is a window into that file
 * rather than a file of its own. Callers get both frames of reference: `startMs`
 * for seeking inside the chapter file, and `relativeStartMs` for laying the
 * passage out on its own timeline starting at zero — which is what an animation
 * needs.
 *
 * Offsets are frame-counted at synthesis time and are exact. This function only
 * filters and subtracts; it never estimates.
 */

export type NarrationSegment = {
	kind: AudioSegment["kind"];
	verse: number | null;
	startMs: number;
	endMs: number;
	relativeStartMs: number;
	relativeEndMs: number;
	durationMs: number;
	text: string;
};

export type NarrationWindow = {
	segments: NarrationSegment[];
	startMs: number;
	endMs: number;
};

export function windowSegments(
	segments: AudioSegment[],
	fromVerse: number | null,
	toVerse: number | null,
): NarrationWindow {
	const inRange =
		fromVerse === null
			? segments
			: segments.filter(
					(s) =>
						s.verseNumber !== null &&
						s.verseNumber >= fromVerse &&
						s.verseNumber <= (toVerse ?? fromVerse),
				);

	if (inRange.length === 0) return { segments: [], startMs: 0, endMs: 0 };

	const startMs = Math.min(...inRange.map((s) => s.startMs));
	const endMs = Math.max(...inRange.map((s) => s.endMs));

	return {
		startMs,
		endMs,
		segments: inRange
			.slice()
			.sort((a, b) => a.startMs - b.startMs)
			.map((s) => ({
				kind: s.kind,
				verse: s.verseNumber,
				startMs: s.startMs,
				endMs: s.endMs,
				relativeStartMs: s.startMs - startMs,
				relativeEndMs: s.endMs - startMs,
				durationMs: s.endMs - s.startMs,
				text: s.text,
			})),
	};
}
