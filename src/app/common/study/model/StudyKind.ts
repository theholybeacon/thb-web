/**
 * What a study is. Both kinds run on the same engine (adoption, sessions,
 * progress); the kind is how the study is labelled and filtered.
 *
 * - plan: a reading plan, e.g. the whole Bible in order, or a topic.
 * - story: one of the Bible's stories, told through its passages and what
 *   helps to read them (Noah's Ark, David and Goliath).
 */
export const STUDY_KINDS = ["plan", "story"] as const;

export type StudyKind = (typeof STUDY_KINDS)[number];

export function isStudyKind(value: unknown): value is StudyKind {
	return typeof value === "string" && (STUDY_KINDS as readonly string[]).includes(value);
}

/** The creator shown for a study whose creatorId is NULL. */
export const HOLY_BEACON_CREATOR = "The Holy Beacon";
