import OpenAI from "openai";
import { canonBook } from "../../canon/model/canon";
import { OPENING_PREFIX, WELCOME_INSTRUCTION } from "./prompt";
import type { LearnerProfile, StudyBuilderDraft } from "../model/StudyBuilder";

export type StudyBuilderChatMessage = { role: "user" | "assistant"; content: string };

/**
 * Streams one builder turn as raw text of the JSON object described in
 * buildSystemPrompt. The caller decodes the reply as it arrives (partialJson)
 * and parses the whole object at the end (parseTurn).
 */
export interface StudyBuilderAI {
	streamTurn(system: string, history: StudyBuilderChatMessage[], context: { profile: LearnerProfile; draft: StudyBuilderDraft | null }): AsyncIterable<string>;
}

/** gpt-4.1-mini: good at following the JSON contract and at long instructions, at small-model cost. */
export const STUDY_BUILDER_MODEL = "gpt-4.1-mini";

export class OpenAIStudyBuilderAI implements StudyBuilderAI {
	private client = new OpenAI();

	async *streamTurn(system: string, history: StudyBuilderChatMessage[]): AsyncIterable<string> {
		const stream = await this.client.chat.completions.create({
			model: STUDY_BUILDER_MODEL,
			stream: true,
			response_format: { type: "json_object" },
			temperature: 0.7,
			messages: [{ role: "system", content: system }, ...history],
		});
		for await (const chunk of stream) {
			const text = chunk.choices[0]?.delta?.content;
			if (text) yield text;
		}
	}
}

/**
 * A scripted builder for e2e tests and local work without an OpenAI key: it
 * follows the same contract, reads the same profile, and never calls anyone.
 * Enabled per browser with the `study_builder_fake_ai=1` cookie, outside
 * production only (see the builder route).
 */
export class FakeStudyBuilderAI implements StudyBuilderAI {
	async *streamTurn(_system: string, history: StudyBuilderChatMessage[], { profile, draft }: { profile: LearnerProfile; draft: StudyBuilderDraft | null }): AsyncIterable<string> {
		const said = history.filter((m) => m.role === "user" && !m.content.startsWith(OPENING_PREFIX)).map((m) => m.content);
		const last = (said[said.length - 1] ?? "").toLowerCase();
		const first = profile.name.split(" ")[0];
		const topBook = profile.reading.books[0];
		const note = profile.notes[0];

		let turn: object;
		if (said.length === 0 && !draft && history[0]?.content === WELCOME_INSTRUCTION && profile.start) {
			// Their first study, from their answers on /welcome: a short walk through Mark for someone who wants to know Jesus.
			const newcomer = profile.start.familiarity === "new";
			turn = {
				reply: `Welcome, ${first}! You said you want to understand who Jesus is${newcomer ? " and that the Bible is new to you" : ""}, with ${profile.start.time === "minutes" ? "a few minutes a day" : "some time each day"}. So I'd start with the Gospel of Mark: the shortest account of Jesus' life, fast and vivid. Here are five readings to begin. How does that sound?`,
				quickReplies: ["Make it shorter", "Go deeper", "This looks good"],
				draft: {
					name: "Meeting Jesus in Mark",
					description: `A first week with Jesus, through the Gospel of Mark, for ${newcomer ? "someone new to the Bible" : "a reader who wants to know him better"}.`,
					topic: "Who Jesus is",
					length: 3,
					depth: 3,
					steps: [
						{ bookAbbreviation: "MRK", chapterNumber: "1", verseNumber: "1-20", title: "The Beginning", explanation: "Mark opens with John the Baptist and Jesus calling his first followers. Notice how quickly they leave everything." },
						{ bookAbbreviation: "MRK", chapterNumber: "2", verseNumber: "1-12", title: "Through the Roof", explanation: "Friends lower a paralysed man through a roof. Watch what Jesus says before he heals him." },
						{ bookAbbreviation: "MRK", chapterNumber: "4", verseNumber: "35-41", title: "Calming the Storm", explanation: "The disciples ask: who is this, that even the wind obeys him? Keep that question with you." },
						{ bookAbbreviation: "MRK", chapterNumber: "8", verseNumber: "27-38", title: "Who Do You Say I Am?", explanation: "Jesus asks the question at the heart of this study, and then says what following him means." },
						{ bookAbbreviation: "MRK", chapterNumber: "16", verseNumber: "1-8", title: "The Empty Tomb", explanation: "Mark ends at the tomb, with fear and wonder. Notice what the young man tells the women." },
					],
				},
				remember: [],
			};
		} else if (said.length === 0 && draft) {
			turn = {
				reply: `Welcome back, ${first}! "${draft.name}" has ${draft.steps.length} readings right now. What would you like to change?`,
				quickReplies: ["Add a psalm at the end", "Make it shorter"],
				draft: null,
				remember: [],
			};
		} else if (said.length === 0) {
			const known = [
				topBook && `you've been spending time in ${canonBook(topBook.usfm)?.englishName ?? topBook.usfm}`,
				note && `you wrote a note on ${note.reference ?? "scripture"} about "${note.title ?? note.content.slice(0, 40)}"`,
			].filter(Boolean);
			turn = {
				reply: `Hi ${first}! ${known.length ? `I see ${known.join(", and ")}.` : "Glad you're here."} What's on your heart right now — is there something you'd like to study?`,
				quickReplies: ["I'm struggling with anxiety", "I want to know Jesus better", "Something short for mornings"],
				draft: null,
				remember: [],
			};
		} else if (!draft) {
			turn = {
				reply: "Thank you for sharing that. Here's a first draft: a week of readings on finding God's peace. How does this feel — would you like it shorter, longer, or deeper?",
				quickReplies: ["Make it shorter", "Add more Psalms", "Looks good"],
				draft: {
					name: "Peace in Anxious Times",
					description: "A week of readings for a restless heart, moving from lament to trust.",
					topic: "Finding God's peace in anxiety",
					length: 3,
					depth: 4,
					steps: [
						{ bookAbbreviation: "PSA", chapterNumber: "23", verseNumber: null, title: "The Lord Is My Shepherd", explanation: "Start with the psalm of rest. Notice every verb God does for you." },
						{ bookAbbreviation: "PHP", chapterNumber: "4", verseNumber: "4-9", title: "Do Not Be Anxious", explanation: "Paul writes from prison about peace. Look at what he tells us to do with worry." },
						{ bookAbbreviation: "MAT", chapterNumber: "6", verseNumber: "25-34", title: "Consider the Lilies", explanation: "Jesus speaks directly to worry. Notice the reasons he gives for trust." },
						{ bookAbbreviation: "1PE", chapterNumber: "5", verseNumber: "6-11", title: "Cast Your Cares", explanation: "Peter connects humility with handing our anxieties to God." },
					],
				},
				remember: [`${first} is going through a season of anxiety.`],
			};
		} else if (last.includes("looks good")) {
			turn = {
				reply: "Wonderful. When you're ready, create the study and start the first reading.",
				quickReplies: ["Make it shorter"],
				draft: null,
				remember: [],
			};
		} else if (last.includes("short")) {
			turn = {
				reply: "Done — I trimmed it to the three readings that carry the heart of it.",
				quickReplies: ["Add more Psalms", "Looks good"],
				draft: { ...draft, length: 2, steps: draft.steps.slice(0, 3) },
				remember: [`${first} prefers short reading plans.`],
			};
		} else {
			turn = {
				reply: "I've added Psalm 46 to close the plan with stillness. Anything else you'd change?",
				quickReplies: ["Looks good", "Make it shorter"],
				draft: { ...draft, steps: [...draft.steps, { bookAbbreviation: "PSA", chapterNumber: "46", verseNumber: null, title: "Be Still", explanation: "End in stillness: God is our refuge and strength." }] },
				remember: [],
			};
		}

		// Stream it in small pieces, like the real model.
		const text = JSON.stringify(turn);
		for (let i = 0; i < text.length; i += 12) {
			yield text.slice(i, i + 12);
			await new Promise((r) => setTimeout(r, 8));
		}
	}
}
