import { describe, expect, it } from "vitest";
import { partialJsonString } from "./ai/partialJson";
import { buildSystemPrompt, learnerHighlights, parseTurn } from "./ai/prompt";
import { FakeStudyBuilderAI, type StudyBuilderAI } from "./ai/StudyBuilderAI";
import { draftStepToInsert, normalizeDraft, normalizeStep } from "./model/draft";
import { studyBuilderTurn } from "./service/studyBuilderTurn";
import type {
	LearnerProfile,
	StudyBuilderConversationFull,
	StudyBuilderDraft,
	StudyBuilderEvent,
	StudyBuilderMessagePayload,
} from "./model/StudyBuilder";

const profile = (over: Partial<LearnerProfile> = {}): LearnerProfile => ({
	name: "Ana Torres",
	locale: "en",
	memberSince: "2025-01-02",
	activeDaysLast30: 9,
	reading: { totalChapters: 42, books: [{ usfm: "ROM", chapters: 16, lastReadAt: "2026-10-01" }], recent: [{ usfm: "ROM", chapter: 8, mode: "read", date: "2026-10-01" }] },
	studies: [{ name: "Grace", topic: "grace", progress: "in-progress", createdAt: "2026-09-01" }],
	notes: [{ reference: "Romans 8:28", title: "Worry", content: "I keep coming back to this when I'm anxious.", date: "2026-10-01" }],
	posts: [{ where: "John 3", kind: "comment", body: "What does born again mean?", date: "2026-09-20" }],
	comments: [],
	pastConversations: [{ title: "Peace", outcome: "unfinished", said: ["I can't sleep"], date: "2026-09-10" }],
	memory: ["Ana reads early in the morning."],
	...over,
});

describe("partialJsonString", () => {
	it("decodes a reply that is still arriving", () => {
		expect(partialJsonString('{"reply": "Hello wor', "reply")).toEqual({ text: "Hello wor", complete: false });
		expect(partialJsonString('{"reply":"Hi\\nthere \\"you\\"", "x"', "reply")).toEqual({ text: 'Hi\nthere "you"', complete: true });
	});

	it("waits for an escape cut in half", () => {
		expect(partialJsonString('{"reply":"caf\\u00', "reply")?.text).toBe("caf");
		expect(partialJsonString('{"reply":"caf\\u00e9', "reply")?.text).toBe("café");
		expect(partialJsonString('{"reply":"a\\', "reply")?.text).toBe("a");
	});

	it("is null before the key arrives", () => {
		expect(partialJsonString('{"rep', "reply")).toBeNull();
	});
});

describe("normalizeStep", () => {
	it("derives the step type from the reference instead of trusting the model", () => {
		expect(normalizeStep({ bookAbbreviation: "rom", chapterNumber: "8", verseNumber: null, stepType: "ChapterRange", title: "x" }))
			.toMatchObject({ bookAbbreviation: "ROM", chapterNumber: "8", stepType: "SingleChapter" });
		expect(normalizeStep({ bookAbbreviation: "Psalms", chapterNumber: "1-3", verseNumber: "2" })?.stepType).toBe("ChapterRange");
		expect(normalizeStep({ bookAbbreviation: "PHP", chapterNumber: "4", verseNumber: "4-9" })?.stepType).toBe("VerseRange");
		expect(normalizeStep({ bookAbbreviation: "JHN", chapterNumber: "3", verseNumber: "16" })?.stepType).toBe("SingleVerse");
		expect(normalizeStep({ bookAbbreviation: "RUT", chapterNumber: null })?.stepType).toBe("FullBook");
	});

	it("drops unknown books and chapters past the end, and clamps ranges", () => {
		expect(normalizeStep({ bookAbbreviation: "XYZ", chapterNumber: "1" })).toBeNull();
		expect(normalizeStep({ bookAbbreviation: "RUT", chapterNumber: "9" })).toBeNull();
		expect(normalizeStep({ bookAbbreviation: "RUT", chapterNumber: "2-9" })?.chapterNumber).toBe("2-4");
	});

	it("titles an untitled step with its reference", () => {
		expect(normalizeStep({ bookAbbreviation: "PSA", chapterNumber: "23" })?.title).toBe("Psalms 23");
	});
});

describe("normalizeDraft / draftStepToInsert", () => {
	it("clamps the scales and keeps only valid steps", () => {
		const draft = normalizeDraft({ name: "Peace", length: 40, depth: "0", steps: [{ bookAbbreviation: "PSA", chapterNumber: "23" }, { bookAbbreviation: "??" }] });
		expect(draft).toMatchObject({ name: "Peace", length: 10, depth: 1 });
		expect(draft?.steps).toHaveLength(1);
		expect(normalizeDraft(null)).toBeNull();
		expect(normalizeDraft({ steps: [] })).toBeNull();
	});

	it("turns a step into the study_step row the reader will run", () => {
		const step = normalizeStep({ bookAbbreviation: "PHP", chapterNumber: "4", verseNumber: "4-9", title: "Peace", explanation: "" })!;
		expect(draftStepToInsert(step, 3)).toMatchObject({
			stepNumber: 3, stepType: "VerseRange", bookAbbreviation: "PHP",
			startChapter: 4, endChapter: 4, startVerse: 4, endVerse: 9,
			explanation: "Read and meditate on Philippians 4:4-9.",
		});
	});
});

describe("prompt", () => {
	it("puts everything known about the reader in front of the model", () => {
		const prompt = buildSystemPrompt(profile(), null);
		for (const fact of ["Ana Torres", "ROM: 16 chapters", "Romans 8:28", "born again", "I can't sleep", "reads early in the morning", "No plan yet"]) {
			expect(prompt).toContain(fact);
		}
		expect(buildSystemPrompt(profile({ locale: "es" }), null)).toContain("Write in Spanish");
	});

	it("parses a turn and survives a sloppy one", () => {
		const turn = parseTurn(JSON.stringify({ reply: " Hi ", quickReplies: ["a", 3, ""], draft: null, remember: ["x"] }));
		expect(turn).toEqual({ reply: "Hi", quickReplies: ["a"], draft: null, remember: ["x"] });
		expect(() => parseTurn("not json")).toThrow();
		expect(() => parseTurn('{"reply":""}')).toThrow();
	});

	it("shows only the sources that have something", () => {
		const kinds = learnerHighlights(profile()).map((h) => h.kind);
		expect(kinds).toEqual(["reading", "activity", "studies", "notes", "posts", "conversations", "memory"]);
		expect(learnerHighlights(profile({ reading: { totalChapters: 0, books: [], recent: [] }, activeDaysLast30: 0, studies: [], notes: [], posts: [], pastConversations: [], memory: [] }))).toEqual([]);
	});
});

/** The DAO surface studyBuilderTurn needs, in memory. */
function memoryDao() {
	const conversations = new Map<string, StudyBuilderConversationFull>();
	const memory: string[] = [];
	let n = 0;
	return {
		conversations,
		memory,
		async createConversation(_userId: string, bibleId: string | null) {
			const c: StudyBuilderConversationFull = { id: `c${++n}`, title: null, status: "active", studyId: null, updatedAt: "", draft: null, bibleId, messages: [] };
			conversations.set(c.id, c);
			return structuredClone(c);
		},
		async getConversation(id: string) {
			const c = conversations.get(id);
			return c ? structuredClone(c) : null;
		},
		async getLearnerProfile() {
			return profile();
		},
		async addMessage(conversationId: string, role: "user" | "assistant", content: string, payload: StudyBuilderMessagePayload | null = null) {
			const m = { id: `m${++n}`, role, content, payload, createdAt: "" };
			conversations.get(conversationId)!.messages.push(m);
			return m;
		},
		async updateConversation(id: string, data: Partial<{ draft: StudyBuilderDraft; title: string; bibleId: string }>) {
			Object.assign(conversations.get(id)!, data);
		},
		async addMemory(_userId: string, facts: string[]) {
			memory.push(...facts);
			return facts.map((fact, i) => ({ id: `f${i}`, fact, createdAt: "" }));
		},
	};
}

async function collect(events: AsyncGenerator<StudyBuilderEvent>) {
	const out: StudyBuilderEvent[] = [];
	for await (const e of events) out.push(e);
	return out;
}

describe("studyBuilderTurn", () => {
	const input = { userId: "u1", locale: "en", bibleId: "b1" };

	it("opens a conversation, knowing the reader, then drafts and refines a plan", async () => {
		const dao = memoryDao();
		const ai = new FakeStudyBuilderAI();

		const opening = await collect(studyBuilderTurn({ ...input, conversationId: null, message: null }, dao, ai));
		expect(opening.map((e) => e.type)).toEqual(expect.arrayContaining(["conversation", "context", "delta", "done"]));
		const streamed = opening.filter((e) => e.type === "delta").map((e) => (e as { text: string }).text).join("");
		const done = opening.at(-1) as Extract<StudyBuilderEvent, { type: "done" }>;
		expect(streamed).toBe(done.message.content);
		expect(streamed).toContain("Romans");
		const id = (opening[0] as { id: string }).id;

		const drafted = (await collect(studyBuilderTurn({ ...input, conversationId: id, message: "I'm anxious" }, dao, ai))).at(-1) as Extract<StudyBuilderEvent, { type: "done" }>;
		expect(drafted.draft?.steps).toHaveLength(4);
		expect(drafted.message.payload?.draftChanged).toBe(true);
		expect(drafted.remembered).toHaveLength(1);
		expect(dao.conversations.get(id)?.title).toBe("Peace in Anxious Times");

		const shorter = (await collect(studyBuilderTurn({ ...input, conversationId: id, message: "Make it shorter" }, dao, ai))).at(-1) as Extract<StudyBuilderEvent, { type: "done" }>;
		expect(shorter.draft?.steps).toHaveLength(3);
		expect(dao.conversations.get(id)?.messages.map((m) => m.role)).toEqual(["assistant", "user", "assistant", "user", "assistant"]);
		expect(dao.memory).toHaveLength(2);
	});

	it("reports a failed model call instead of saving a broken turn", async () => {
		const dao = memoryDao();
		const broken: StudyBuilderAI = {
			async *streamTurn() {
				yield '{"reply": "Hel';
				throw new Error("network");
			},
		};
		const events = await collect(studyBuilderTurn({ ...input, conversationId: null, message: "hi" }, dao, broken));
		expect(events.at(-1)?.type).toBe("error");
		expect([...dao.conversations.values()][0].messages.map((m) => m.role)).toEqual(["user"]);
	});

	it("refuses someone else's conversation", async () => {
		const events = await collect(studyBuilderTurn({ ...input, conversationId: "nope", message: "hi" }, memoryDao(), new FakeStudyBuilderAI()));
		expect(events).toEqual([{ type: "error", error: "Conversation not found" }]);
	});
});
