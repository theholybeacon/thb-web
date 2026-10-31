/**
 * What a reader tells us on their first visit (/welcome): how well they know
 * the Bible, how deep they want to go, what they want to understand and how
 * much time they have. The study builder reads it to recommend their first
 * study. Pure, so the page, the server and the prompt share one definition.
 */

export const FAMILIARITY = ["new", "some", "regular", "deep"] as const;
export const DEPTH = ["light", "steady", "deep"] as const;
export const TIME = ["minutes", "quarter", "long"] as const;
export const INTERESTS = [
	"jesus",
	"prayer",
	"hardSeason",
	"bigStory",
	"wisdom",
	"oneBook",
	"people",
	"faithDoubts",
] as const;

export type Familiarity = (typeof FAMILIARITY)[number];
export type Depth = (typeof DEPTH)[number];
export type StudyTime = (typeof TIME)[number];
export type Interest = (typeof INTERESTS)[number];

export type ReaderStart = {
	familiarity: Familiarity;
	depth: Depth;
	interests: Interest[];
	/** In their own words; optional. */
	note: string;
	time: StudyTime;
};

export const NOTE_MAX = 500;

/** The answers as the model reads them: in English, whatever the reader's language. */
const FAMILIARITY_TEXT: Record<Familiarity, string> = {
	new: "new to the Bible, has barely read it",
	some: "has read some of the Bible here and there",
	regular: "reads the Bible regularly",
	deep: "has studied the Bible in depth",
};
const DEPTH_TEXT: Record<Depth, string> = {
	light: "light: a passage and a short reflection",
	steady: "steady: understand the passage and its context",
	deep: "deep: original words, connections across Scripture, careful study",
};
const TIME_TEXT: Record<StudyTime, string> = {
	minutes: "a few minutes a day",
	quarter: "about 15 minutes a day",
	long: "longer sessions, 30 minutes or more",
};
const INTEREST_TEXT: Record<Interest, string> = {
	jesus: "who Jesus is",
	prayer: "how to pray",
	hardSeason: "getting through a hard season",
	bigStory: "the big story of the Bible, start to end",
	wisdom: "wisdom for daily life",
	oneBook: "one book of the Bible, closely",
	people: "the people of the Bible",
	faithDoubts: "questions and doubts about faith",
};

/** The plan's scales (1-10) the answers point to, as a starting point for the builder. */
export const DEPTH_SCALE: Record<Depth, number> = { light: 3, steady: 5, deep: 8 };
export const LENGTH_FOR_TIME: Record<StudyTime, number> = { minutes: 3, quarter: 4, long: 5 };

function oneOf<T extends string>(values: readonly T[], value: unknown): T | null {
	return typeof value === "string" && (values as readonly string[]).includes(value) ? (value as T) : null;
}

/** Answers from the page or the database, made safe; null when they are not a complete set. */
export function parseReaderStart(input: unknown): ReaderStart | null {
	if (!input || typeof input !== "object") return null;
	const data = input as Record<string, unknown>;
	const familiarity = oneOf(FAMILIARITY, data.familiarity);
	const depth = oneOf(DEPTH, data.depth);
	const time = oneOf(TIME, data.time);
	if (!familiarity || !depth || !time) return null;
	const interests = Array.isArray(data.interests)
		? [...new Set(data.interests.map((i) => oneOf(INTERESTS, i)).filter((i): i is Interest => i !== null))]
		: [];
	const note = typeof data.note === "string" ? data.note.trim().slice(0, NOTE_MAX) : "";
	return { familiarity, depth, interests, note, time };
}

/** The answers as lines of the builder's prompt. */
export function describeReaderStart(start: ReaderStart): string[] {
	return [
		`Familiarity: ${FAMILIARITY_TEXT[start.familiarity]}.`,
		`How deep they want to go: ${DEPTH_TEXT[start.depth]} (depth ${DEPTH_SCALE[start.depth]} on the plan's scale).`,
		`Time they have: ${TIME_TEXT[start.time]} (suggests length ${LENGTH_FOR_TIME[start.time]} on the plan's scale).`,
		`What they want to understand: ${start.interests.length ? start.interests.map((i) => INTEREST_TEXT[i]).join("; ") : "they did not pick a topic"}.`,
		start.note ? `In their own words: "${start.note}"` : "They did not add anything in their own words.",
	];
}
