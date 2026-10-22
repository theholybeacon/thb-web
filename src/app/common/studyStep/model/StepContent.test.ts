import { describe, expect, it } from "vitest";
import { stepContentProblems, youtubeEmbedUrl } from "./StepContent";
import { sanitizeStudySteps } from "./sanitizeSteps";
import { formatStepReference, stepChapterCount } from "./reference";
import type { StudyStep, StudyStepInsert } from "./StudyStep";

const image = {
	kind: "image",
	url: "https://upload.wikimedia.org/x.jpg",
	alt: "An engraving",
	credit: "Gustave Doré (1866). Public domain.",
};

describe("stepContentProblems", () => {
	it("accepts a scripture step with a book and no content", () => {
		expect(stepContentProblems({ kind: "scripture", bookAbbreviation: "GEN", content: null })).toEqual([]);
	});

	it("treats a step without a kind as scripture, as every step before kinds was", () => {
		expect(stepContentProblems({ bookAbbreviation: "GEN" })).toEqual([]);
		expect(stepContentProblems({})).toEqual(["a scripture step needs a book"]);
	});

	it("accepts each kind's content", () => {
		const contents = [
			{ kind: "text", body: "In the beginning (Genesis 1:1)." },
			{ kind: "reflection", prompt: "What do you notice?" },
			{ kind: "character", entitySlug: "noah_2210" },
			image,
			{ kind: "video", provider: "youtube", videoId: "dQw4w9WgXcQ", credit: "A channel" },
			{ kind: "link", linkType: "book", url: "https://example.com/book", title: "A book" },
		];
		for (const content of contents) {
			expect(stepContentProblems({ kind: content.kind, content })).toEqual([]);
		}
	});

	it("rejects content of another kind than the step", () => {
		expect(stepContentProblems({ kind: "text", content: image })).toEqual(['content is "image" but the step is "text"']);
	});

	it("rejects an unknown kind", () => {
		expect(stepContentProblems({ kind: "podcast", content: {} })).toEqual(['unknown step kind "podcast"']);
	});

	it("rejects an image that is not served over https", () => {
		expect(stepContentProblems({ kind: "image", content: { ...image, url: "http://example.com/x.jpg" } })).not.toEqual([]);
	});

	it("rejects a video given as a URL instead of an id, or ending before it starts", () => {
		const video = { kind: "video", provider: "youtube", credit: "A channel" };
		expect(stepContentProblems({ kind: "video", content: { ...video, videoId: "https://youtu.be/dQw4w9WgXcQ" } })).not.toEqual([]);
		expect(stepContentProblems({ kind: "video", content: { ...video, videoId: "dQw4w9WgXcQ", start: 30, end: 10 } }))
			.toEqual(["end: video end must be after start"]);
	});

	it("rejects empty text", () => {
		expect(stepContentProblems({ kind: "text", content: { kind: "text", body: "   " } })).not.toEqual([]);
	});
});

describe("youtubeEmbedUrl", () => {
	it("embeds without tracking cookies and keeps the start and end", () => {
		expect(youtubeEmbedUrl({ videoId: "dQw4w9WgXcQ", start: 30, end: 90 }))
			.toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1&start=30&end=90");
	});
});

describe("sanitizeStudySteps", () => {
	const scripture = (n: number): StudyStepInsert => ({
		studyId: "", stepNumber: n, kind: "scripture", stepType: "SingleChapter", title: `Step ${n}`, explanation: "", bookAbbreviation: "GEN", startChapter: n, endChapter: n,
	});

	it("drops steps that cannot be shown and renumbers the rest from 1", () => {
		const steps = sanitizeStudySteps([
			scripture(3),
			{ studyId: "", stepNumber: 2, kind: "text", title: "Background", explanation: "", content: { kind: "text", body: "" } },
			{ studyId: "", stepNumber: 1, kind: "reflection", title: "Think", explanation: "", content: { kind: "reflection", prompt: "Why?" } },
		]);
		expect(steps.map((s) => [s.stepNumber, s.kind])).toEqual([[1, "reflection"], [2, "scripture"]]);
	});

	it("never saves content on a scripture step or a stepType on the others", () => {
		const [step] = sanitizeStudySteps([{ ...scripture(1), content: null }]);
		expect(step.content).toBeNull();
		const [reflection] = sanitizeStudySteps([
			{ studyId: "", stepNumber: 1, kind: "reflection", stepType: "SingleVerse", title: "t", explanation: "", content: { kind: "reflection", prompt: "Why?" } },
		]);
		expect(reflection.stepType).toBeNull();
	});
});

describe("step references", () => {
	const step = (fields: Partial<StudyStep>): StudyStep => ({
		id: "s", studyId: "x", stepNumber: 1, kind: "scripture", stepType: null, content: null, title: "", explanation: "",
		bookAbbreviation: "GEN", startChapter: 9, endChapter: 9, startVerse: 13, endVerse: 13, createdAt: null, updatedAt: null,
		...fields,
	});

	it("gives a passage its reference and its chapters", () => {
		expect(formatStepReference(step({}))).toBe("GEN 9:13");
		expect(stepChapterCount(step({}))).toBe(1);
	});

	it("gives a reflection anchored on a verse neither: the anchor is where its note goes", () => {
		const reflection = step({ kind: "reflection", content: { kind: "reflection", prompt: "Why?" } });
		expect(formatStepReference(reflection)).toBe("");
		expect(stepChapterCount(reflection)).toBe(0);
	});
});
