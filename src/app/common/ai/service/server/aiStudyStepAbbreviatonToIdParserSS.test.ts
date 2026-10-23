import { describe, expect, it } from "vitest";
import { aiStudyStepAbbreviatonToIdParserSS } from "./aiStudyStepAbbreviatonToIdParserSS";
import { StudyStepType } from "@/app/common/studyStep/model/StudyStepType";
import { stepContentProblems } from "@/app/common/studyStep/model/StepContent";

const scripture = {
	stepNumber: 1, title: "The call", explanation: "Read it.", stepType: StudyStepType.VerseRange,
	bookAbbreviation: "GEN", chapterNumber: "12", verseNumber: "1-9",
};

describe("aiStudyStepAbbreviatonToIdParserSS", () => {
	it("reads a passage, with or without a kind (older generator output has none)", async () => {
		for (const input of [scripture, { ...scripture, kind: "scripture" as const }]) {
			const step = await aiStudyStepAbbreviatonToIdParserSS(input);
			expect(step).toMatchObject({ kind: "scripture", startChapter: 12, endChapter: 12, startVerse: 1, endVerse: 9 });
			expect(stepContentProblems(step)).toEqual([]);
		}
	});

	it("turns text and reflection steps into content steps", async () => {
		const text = await aiStudyStepAbbreviatonToIdParserSS({ ...scripture, kind: "text", body: "Abram lived in Haran (Genesis 11:31)." });
		expect(text).toMatchObject({ kind: "text", stepType: null, bookAbbreviation: null, content: { kind: "text", body: "Abram lived in Haran (Genesis 11:31)." } });
		expect(stepContentProblems(text)).toEqual([]);

		const reflection = await aiStudyStepAbbreviatonToIdParserSS({ ...scripture, kind: "reflection", prompt: "What would you leave?" });
		expect(reflection.content).toEqual({ kind: "reflection", prompt: "What would you leave?" });
		expect(stepContentProblems(reflection)).toEqual([]);
	});

	it("leaves an empty text step for the save to drop", async () => {
		const text = await aiStudyStepAbbreviatonToIdParserSS({ ...scripture, kind: "text" });
		expect(stepContentProblems(text)).not.toEqual([]);
	});
});
