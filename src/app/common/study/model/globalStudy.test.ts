import { describe, expect, it } from "vitest";
import { GlobalStudyDef, globalStudyStepInserts, validateGlobalStudy } from "./globalStudy";
import { GLOBAL_STUDIES } from "./globalStudyCatalog";
import { STORIES } from "./stories";

const base: GlobalStudyDef = {
	slug: "story-test",
	kind: "story",
	language: "en",
	name: "Test",
	description: "A test story.",
	topic: "Testing.",
	length: 1,
	depth: 1,
	sortOrder: 0,
	coversWholeCanon: false,
	steps: [{ book: "GEN", startChapter: 4, title: "Cain and Abel", explanation: "Read it." }],
};

describe("the catalog", () => {
	it.each(GLOBAL_STUDIES.map((def) => [def.slug, def] as const))("%s is valid", (_slug, def) => {
		expect(validateGlobalStudy(def)).toEqual([]);
	});

	it("has no two studies with the same slug", () => {
		const slugs = GLOBAL_STUDIES.map((def) => def.slug);
		expect(new Set(slugs).size).toBe(slugs.length);
	});

	it("lists every story as a story, after the plans", () => {
		const plansEnd = Math.max(...GLOBAL_STUDIES.filter((d) => (d.kind ?? "plan") === "plan").map((d) => d.sortOrder));
		for (const story of STORIES) {
			expect(story.kind).toBe("story");
			expect(story.slug.startsWith("story-")).toBe(true);
			expect(story.sortOrder).toBeGreaterThan(plansEnd);
		}
	});
});

describe("validateGlobalStudy", () => {
	it("accepts a verse range inside one chapter", () => {
		expect(validateGlobalStudy({ ...base, steps: [{ book: "GEN", startChapter: 4, startVerse: 1, endVerse: 16, title: "t", explanation: "e" }] })).toEqual([]);
	});

	it("rejects a verse range across a chapter break, which the reader cannot show", () => {
		expect(validateGlobalStudy({ ...base, steps: [{ book: "GEN", startChapter: 6, endChapter: 9, startVerse: 9, endVerse: 17, title: "t", explanation: "e" }] }))
			.toEqual(["step 1 (GEN 6-9): a verse range must stay in one chapter"]);
	});

	it("rejects a study with no Scripture in it", () => {
		expect(validateGlobalStudy({ ...base, steps: [{ title: "t", content: { kind: "text", body: "b" } }] }))
			.toContain("no scripture step: a study reads the Bible");
	});

	it("rejects bad content and an anchor on anything but a reflection", () => {
		const problems = validateGlobalStudy({
			...base,
			steps: [
				...base.steps,
				{ title: "t", content: { kind: "text", body: "b" }, anchor: { book: "GEN", chapter: 4 } },
				{ title: "t", content: { kind: "image", url: "ftp://x", alt: "a", credit: "c" } },
			],
		});
		expect(problems).toContain("step 2 (text): only a reflection has an anchor");
		expect(problems.some((p) => p.startsWith("step 3 (image): url"))).toBe(true);
	});
});

describe("globalStudyStepInserts", () => {
	it("writes each kind with its content, and a reflection's anchor as its passage", () => {
		const inserts = globalStudyStepInserts({
			...base,
			steps: [
				{ book: "GEN", startChapter: 4, startVerse: 1, endVerse: 16, title: "Read", explanation: "e" },
				{ title: "Think", content: { kind: "reflection", prompt: "Why?" }, anchor: { book: "GEN", chapter: 4, verse: 9 } },
			],
		});
		expect(inserts[0]).toMatchObject({ kind: "scripture", stepType: "VerseRange", content: null, startChapter: 4, endChapter: 4, startVerse: 1, endVerse: 16 });
		expect(inserts[1]).toMatchObject({ kind: "reflection", stepType: null, content: { kind: "reflection", prompt: "Why?" }, bookAbbreviation: "GEN", startChapter: 4, startVerse: 9, explanation: "" });
	});
});
