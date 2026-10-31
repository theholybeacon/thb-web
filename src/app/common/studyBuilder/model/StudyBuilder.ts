import type { StudyStepType } from "../../studyStep/model/StudyStepType";
import type { ReaderStart } from "../../user/model/ReaderStart";

/**
 * One reading in the plan being assembled. References use the same string
 * shapes the original generator asked for ("5" or "5-7"), and `bookAbbreviation`
 * is always a canonical USFM code once it has been through normalizeDraft.
 */
export type StudyBuilderDraftStep = {
	bookAbbreviation: string;
	chapterNumber: string | null;
	verseNumber: string | null;
	stepType: StudyStepType;
	title: string;
	explanation: string;
};

/** The plan as it stands in a conversation — what "Create this study" saves. */
export type StudyBuilderDraft = {
	name: string;
	description: string;
	topic: string;
	/** 1 = a few minutes … 10 = a year, the scale the study table already uses. */
	length: number;
	/** 1 = shallow … 10 = deep. */
	depth: number;
	steps: StudyBuilderDraftStep[];
};

export type StudyBuilderMessagePayload = {
	/** Short answers the reader can tap instead of typing. */
	quickReplies?: string[];
	/** The turn changed the plan. */
	draftChanged?: boolean;
	/** Things the builder decided to remember from this turn. */
	remembered?: string[];
};

export type StudyBuilderMessage = {
	id: string;
	role: "user" | "assistant";
	content: string;
	payload: StudyBuilderMessagePayload | null;
	createdAt: string;
};

/**
 * active: no study yet. created: the plan is a study and the study matches it.
 * editing: the plan of an existing study has changes that are not saved yet.
 */
export type StudyBuilderStatus = "active" | "created" | "editing";

export type StudyBuilderConversationSummary = {
	id: string;
	title: string | null;
	status: StudyBuilderStatus;
	studyId: string | null;
	updatedAt: string;
};

export type StudyBuilderConversationFull = StudyBuilderConversationSummary & {
	draft: StudyBuilderDraft | null;
	bibleId: string | null;
	messages: StudyBuilderMessage[];
};

export type StudyBuilderMemoryFact = {
	id: string;
	fact: string;
	createdAt: string;
};

/**
 * Everything the app knows about a reader, gathered for the builder's prompt.
 * Every list is already trimmed to what is worth spending tokens on.
 */
export type LearnerProfile = {
	name: string;
	locale: string;
	memberSince: string | null;
	activeDaysLast30: number;
	reading: {
		totalChapters: number;
		/** Books by how much of them the reader has read, most first. */
		books: { usfm: string; chapters: number; lastReadAt: string }[];
		recent: { usfm: string; chapter: number; mode: string; date: string }[];
	};
	studies: {
		name: string;
		topic: string;
		/** not-started | in-progress | completed */
		progress: string;
		createdAt: string;
	}[];
	notes: { reference: string | null; title: string | null; content: string; date: string }[];
	/** Threads they started: questions, analysis, corrections. */
	posts: { where: string | null; kind: string; body: string; date: string }[];
	/** Replies they wrote in community threads. */
	comments: { where: string | null; body: string; date: string }[];
	pastConversations: {
		title: string | null;
		outcome: "created" | "unfinished";
		said: string[];
		date: string;
	}[];
	memory: string[];
	/** What they told us on their first visit (/welcome); null when they skipped it or joined before it. */
	start: ReaderStart | null;
};

/** A line in the "what I know about you" strip above the chat. */
export type LearnerHighlight = {
	kind: "start" | "reading" | "studies" | "notes" | "posts" | "comments" | "conversations" | "memory" | "activity";
	count: number;
	/** For reading: the USFM code of the book they have read most. */
	detail?: string;
};

/** What one AI turn produces, once parsed and checked. */
export type StudyBuilderTurn = {
	reply: string;
	quickReplies: string[];
	/** The full revised plan, or null when this turn did not change it. */
	draft: StudyBuilderDraft | null;
	remember: string[];
};

/** The builder route streams these, one JSON object per line. */
export type StudyBuilderEvent =
	| { type: "conversation"; id: string }
	| { type: "context"; highlights: LearnerHighlight[] }
	| { type: "delta"; text: string }
	| {
			type: "done";
			message: StudyBuilderMessage;
			draft: StudyBuilderDraft | null;
			status: StudyBuilderStatus;
			remembered: StudyBuilderMemoryFact[];
	  }
	| { type: "error"; error: string };
