import { CANON } from "../../canon/model/canon";
import { normalizeDraft } from "../model/draft";
import type { LearnerHighlight, LearnerProfile, StudyBuilderDraft, StudyBuilderTurn } from "../model/StudyBuilder";
import { describeReaderStart } from "../../user/model/ReaderStart";

/**
 * Everything the builder model is told, and how its answer is read back. Pure,
 * so the prompt can be tested without a model or a database.
 */

const LANGUAGES: Record<string, string> = { en: "English", es: "Spanish" };

const BOOK_CODES = CANON.map((b) => `${b.usfm}=${b.englishName}(${b.chapters})`).join(", ");

const LENGTH_SCALE = "1 = a few minutes, 3 = about a week, 5 = about a month, 7 = about three months, 10 = a year";

function list<T>(items: T[], render: (item: T) => string, empty = "none"): string {
	return items.length ? items.map((i) => `- ${render(i)}`).join("\n") : `- ${empty}`;
}

/** The reader, as the model reads them. Sections stay even when empty: "no notes yet" is information too. */
export function renderLearnerProfile(p: LearnerProfile): string {
	return [
		`Name: ${p.name}`,
		`Member since: ${p.memberSince ?? "unknown"}. Active on ${p.activeDaysLast30} of the last 30 days.`,
		"",
		"WHAT THEY TOLD US WHEN THEY JOINED (their starting point; later conversations and memory override it):",
		p.start ? describeReaderStart(p.start).map((l) => `- ${l}`).join("\n") : "- nothing, they skipped the questions",
		"",
		"WHAT THE BUILDER REMEMBERS FROM EARLIER CONVERSATIONS:",
		list(p.memory, (m) => m),
		"",
		`READING HISTORY (${p.reading.totalChapters} chapters completed in total):`,
		"Most-read books:",
		list(p.reading.books, (b) => `${b.usfm}: ${b.chapters} chapters, last on ${b.lastReadAt}`),
		"Most recent chapters:",
		list(p.reading.recent, (r) => `${r.usfm} ${r.chapter} (${r.mode}, ${r.date})`),
		"",
		"STUDIES THEY HAVE HAD:",
		list(p.studies, (s) => `"${s.name}" — ${s.topic || "no topic"} — ${s.progress} (created ${s.createdAt})`),
		"",
		"THEIR PERSONAL NOTES ON SCRIPTURE:",
		list(p.notes, (n) => `${n.reference ?? "general"}${n.title ? ` "${n.title}"` : ""}: ${n.content} (${n.date})`),
		"",
		"QUESTIONS AND POSTS THEY STARTED IN THE COMMUNITY:",
		list(p.posts, (c) => `[${c.kind}] on ${c.where ?? "a thread"}: ${c.body} (${c.date})`),
		"",
		"REPLIES THEY WROTE IN THE COMMUNITY:",
		list(p.comments, (c) => `on ${c.where ?? "a thread"}: ${c.body} (${c.date})`),
		"",
		"EARLIER STUDY-BUILDER CONVERSATIONS:",
		list(p.pastConversations, (c) => `${c.date} — ${c.title ?? "untitled"} (${c.outcome}). They said: ${c.said.map((s) => `"${s}"`).join(" / ")}`),
	].join("\n");
}

export function buildSystemPrompt(profile: LearnerProfile, draft: StudyBuilderDraft | null): string {
	const language = LANGUAGES[profile.locale] ?? "English";
	return `You are the study builder of The Holy Beacon, a Bible reading app. You help one reader shape a personal Bible study plan through a real back-and-forth conversation — like a thoughtful pastor or study partner who knows them well, not a form.

HOW TO TALK
- Write in ${language}. Warm, personal, concise: 1-3 short paragraphs. Light markdown (**bold**, lists) is fine.
- Use what you know about the reader. Bring up specifics naturally and name them: a note they wrote, a book they have been reading, a question they asked, a study they never finished, something they told you before. Never invent facts that are not in the profile below.
- Ask ONE good question at a time. Listen, then build.
- Do not interrogate. After at most two questions, propose a first draft of the plan and keep refining it with them. Every later turn should move the plan forward or explain a change.
- When they ask for a change ("shorter", "more Psalms", "swap step 3"), make it in the draft and say briefly what you changed.
- Avoid repeating readings they have already completed many times unless they want to revisit them, and connect new readings to what they have read.
- Offer 2-4 quickReplies: short, natural things THEY might say next (first person, under 8 words each), including at least one that changes the plan.

THE PLAN
- A plan is a name, a description (who it is for and what it does), a topic (the focus in a sentence), length (${LENGTH_SCALE}), depth (1 = light devotional … 10 = deep study) and ordered steps.
- The number of steps should fit the length: a week is about 7 steps, a month about 20-30.
- Each step is one reading: bookAbbreviation (a code from the list below), chapterNumber ("5" or "5-7", or null for the whole book), verseNumber ("16" or "16-18", only with a single chapter, else null), a short engaging title, and an explanation of 2-4 sentences in ${language}: why this passage, what to look for, and how it connects to this reader.
- Book codes (code=name(chapters)): ${BOOK_CODES}

THE PLAN AS IT STANDS
The reader can also change the plan by hand, in a manual editor next to this conversation. This is always the latest version, their own changes included: build on it, never quietly undo what they changed.
${draft ? JSON.stringify(draft) : "No plan yet."}

WHAT YOU KNOW ABOUT THE READER
${renderLearnerProfile(profile)}

ANSWER FORMAT
Answer with ONE JSON object and nothing else, with the keys in exactly this order:
{"reply": string, "quickReplies": string[], "draft": object | null, "remember": string[]}
- reply: what you say to the reader.
- draft: the COMPLETE revised plan {"name","description","topic","length","depth","steps":[...]} whenever this turn creates or changes it; null when it stays as it is.
- remember: new durable facts about the reader worth remembering in future conversations (life situation, goals, preferences, struggles, schedule), in third person, one short sentence each. Only things they told you that are not already remembered. Usually empty.`;
}

/** Every opening instruction starts with this, so a scripted model can tell it from what the reader said. */
export const OPENING_PREFIX = "(The reader ";

export const OPENING_INSTRUCTION =
	`${OPENING_PREFIX}just opened the study builder. Greet them by first name and open the conversation: show you know them by mentioning one or two specific things from their profile, then ask what they would like to study or what is going on in their life right now. No plan yet.)`;

/**
 * A reader's very first conversation, straight from /welcome: the builder
 * already has their answers, so it recommends a first study at once instead of
 * asking what they want.
 */
export const WELCOME_INSTRUCTION =
	`${OPENING_PREFIX}just joined and answered a few questions about where they are with the Bible (WHAT THEY TOLD US WHEN THEY JOINED, above). This is their first study. Greet them by first name and welcome them in one sentence. Recommend a first study that fits their answers: their familiarity, how deep they want to go, the time they have, and above all what they want to understand. Say in a sentence or two why you chose it, in plain words, without jargon if they are new to the Bible. Put the complete plan in draft now, sized to their time (length and depth from their answers). End by asking how it sounds or what they would change. Offer quickReplies that adjust it: shorter, deeper, a different focus, or that they are ready to start.)`;

/** Their first conversation ever, with answers from /welcome to start from. */
export function isWelcome(profile: Pick<LearnerProfile, "start" | "studies" | "pastConversations">): boolean {
	return Boolean(profile.start) && profile.studies.length === 0 && profile.pastConversations.length === 0;
}

/**
 * The first turn has no reader message: the builder opens the conversation
 * itself. What it says depends on what is already there: nothing, a plan they
 * started by hand, or a study they came back to change.
 */
export function openingInstruction(draft: StudyBuilderDraft | null, editingStudy: boolean, welcome = false): string {
	if (editingStudy && draft) {
		return `${OPENING_PREFIX}came back to change their study "${draft.name}", the plan above. Greet them by first name, say in a sentence what the plan is now, and ask what they would like to change. Do not change the plan yet.)`;
	}
	if (draft) {
		return `${OPENING_PREFIX}started this plan by hand and is asking for your help with it. Greet them by first name, react briefly and specifically to what they have so far, connect it to something you know about them, and ask how you can help shape it. Do not change the plan yet.)`;
	}
	return welcome ? WELCOME_INSTRUCTION : OPENING_INSTRUCTION;
}

/** The model's JSON, made safe. Throws only when there is nothing usable at all. */
export function parseTurn(raw: string): StudyBuilderTurn {
	let data: Record<string, unknown>;
	try {
		data = JSON.parse(raw);
	} catch {
		throw new Error("The study builder answered in an unexpected format.");
	}
	const reply = typeof data.reply === "string" ? data.reply.trim() : "";
	if (!reply) throw new Error("The study builder answered without a reply.");
	const strings = (value: unknown, max: number, len: number) =>
		(Array.isArray(value) ? value : [])
			.filter((v): v is string => typeof v === "string" && v.trim().length > 0)
			.map((v) => v.trim().slice(0, len))
			.slice(0, max);
	return {
		reply,
		quickReplies: strings(data.quickReplies, 4, 80),
		draft: normalizeDraft(data.draft),
		remember: strings(data.remember, 5, 500),
	};
}

/** The "what I know about you" chips: only the sources that actually have something in them. */
export function learnerHighlights(p: LearnerProfile): LearnerHighlight[] {
	const out: LearnerHighlight[] = [];
	if (p.start) out.push({ kind: "start", count: 1 });
	if (p.reading.totalChapters) out.push({ kind: "reading", count: p.reading.totalChapters, detail: p.reading.books[0]?.usfm });
	if (p.activeDaysLast30) out.push({ kind: "activity", count: p.activeDaysLast30 });
	if (p.studies.length) out.push({ kind: "studies", count: p.studies.length });
	if (p.notes.length) out.push({ kind: "notes", count: p.notes.length });
	if (p.posts.length) out.push({ kind: "posts", count: p.posts.length });
	if (p.comments.length) out.push({ kind: "comments", count: p.comments.length });
	if (p.pastConversations.length) out.push({ kind: "conversations", count: p.pastConversations.length });
	if (p.memory.length) out.push({ kind: "memory", count: p.memory.length });
	return out;
}
