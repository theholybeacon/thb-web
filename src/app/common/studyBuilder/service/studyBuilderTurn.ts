import { partialJsonString } from "../ai/partialJson";
import { buildSystemPrompt, isWelcome, learnerHighlights, openingInstruction, parseTurn } from "../ai/prompt";
import type { StudyBuilderAI, StudyBuilderChatMessage } from "../ai/StudyBuilderAI";
import type { StudyBuilderPostgreSQLDao } from "../dao/StudyBuilderPostgreSQLDao";
import { normalizeDraft } from "../model/draft";
import type { StudyBuilderEvent } from "../model/StudyBuilder";

/** How many earlier turns of this conversation go back to the model verbatim. */
const HISTORY_TURNS = 24;

export type StudyBuilderTurnInput = {
	userId: string;
	locale: string;
	/** null starts a new conversation. */
	conversationId: string | null;
	/** null asks the builder to open the conversation itself. */
	message: string | null;
	bibleId: string | null;
	/**
	 * The plan as the page has it, manual edits included. Undefined leaves the
	 * saved plan as it is.
	 */
	draft?: unknown;
};

type Dao = Pick<StudyBuilderPostgreSQLDao, "createConversation" | "getConversation" | "getLearnerProfile" | "addMessage" | "updateConversation" | "addMemory">;

/**
 * One back-and-forth: saves what the reader said, gathers what the app knows
 * about them, streams the builder's answer, then saves the answer, the revised
 * plan and anything worth remembering. Yields the events the route streams to
 * the page, in order: conversation → context → delta… → done (or error).
 */
export async function* studyBuilderTurn(input: StudyBuilderTurnInput, dao: Dao, ai: StudyBuilderAI): AsyncGenerator<StudyBuilderEvent> {
	const conversation = input.conversationId
		? await dao.getConversation(input.conversationId, input.userId)
		: await dao.createConversation(input.userId, input.bibleId);
	if (!conversation) {
		yield { type: "error", error: "Conversation not found" };
		return;
	}
	yield { type: "conversation", id: conversation.id };

	const message = input.message?.trim().slice(0, 4000) || null;
	if (message) await dao.addMessage(conversation.id, "user", message);

	// The reader may have changed the plan by hand since the last turn: the model works on their version.
	let draft = conversation.draft;
	let status = conversation.status;
	const changes: Parameters<Dao["updateConversation"]>[1] = {};
	if (input.draft !== undefined) {
		const sent = normalizeDraft(input.draft);
		if (JSON.stringify(sent) !== JSON.stringify(draft)) {
			draft = sent;
			changes.draft = sent;
			if (sent) changes.title = sent.name;
			if (conversation.studyId) status = changes.status = "editing";
		}
	}
	if (input.bibleId && input.bibleId !== conversation.bibleId) changes.bibleId = input.bibleId;
	if (Object.keys(changes).length) await dao.updateConversation(conversation.id, changes);

	const profile = await dao.getLearnerProfile(input.userId, input.locale, conversation.id);
	yield { type: "context", highlights: learnerHighlights(profile) };

	const history: StudyBuilderChatMessage[] = conversation.messages
		.slice(-HISTORY_TURNS)
		.map((m) => ({ role: m.role, content: m.content }));
	if (message) history.push({ role: "user", content: message });
	// The model always needs a user turn to answer; the opening one is an instruction.
	const prompt = history.length ? history : [{ role: "user" as const, content: openingInstruction(draft, Boolean(conversation.studyId), isWelcome(profile)) }];

	let raw = "";
	let sent = 0;
	try {
		for await (const chunk of ai.streamTurn(buildSystemPrompt(profile, draft), prompt, { profile, draft })) {
			raw += chunk;
			const reply = partialJsonString(raw, "reply");
			if (reply && reply.text.length > sent) {
				yield { type: "delta", text: reply.text.slice(sent) };
				sent = reply.text.length;
			}
		}
	} catch (e) {
		console.error("study builder: model call failed", e);
		yield { type: "error", error: "The study builder is unavailable right now. Please try again." };
		return;
	}

	let turn;
	try {
		turn = parseTurn(raw);
	} catch (e) {
		yield { type: "error", error: e instanceof Error ? e.message : "Unexpected answer" };
		return;
	}

	const assistant = await dao.addMessage(conversation.id, "assistant", turn.reply, {
		quickReplies: turn.quickReplies,
		draftChanged: Boolean(turn.draft),
		remembered: turn.remember,
	});
	if (turn.draft && conversation.studyId) status = "editing";
	await dao.updateConversation(conversation.id, turn.draft ? { draft: turn.draft, title: turn.draft.name, status } : {});
	const remembered = await dao.addMemory(input.userId, turn.remember, conversation.id);

	yield { type: "done", message: assistant, draft: turn.draft ?? draft, status, remembered };
}
