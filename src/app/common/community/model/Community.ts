import { contributionTable } from "@/db/schema/contribution";
import { NOTE_TARGET_TYPES, type NoteTargetType } from "@/app/common/note/noteScope";
import type { NoteTargetInput } from "@/app/common/note/model/Note";
import { communityCommentTable } from "@/db/schema/communityComment";
import { communityVoteTable } from "@/db/schema/communityVote";
import { communityFlagTable } from "@/db/schema/communityFlag";

export type Contribution = typeof contributionTable.$inferSelect;
export type ContributionInsert = typeof contributionTable.$inferInsert;
export type CommunityComment = typeof communityCommentTable.$inferSelect;
export type CommunityCommentInsert = typeof communityCommentTable.$inferInsert;
export type CommunityVoteInsert = typeof communityVoteTable.$inferInsert;
export type CommunityFlagInsert = typeof communityFlagTable.$inferInsert;

export type VoteTargetType = "contribution" | "comment";
export type ContributionSection = "overview" | "timeline" | "relationships" | "significance" | "general";
export const CONTRIBUTION_SECTIONS: ContributionSection[] = [
	"overview",
	"timeline",
	"relationships",
	"significance",
	"general",
];

/**
 * Scripture threads reuse the note scope vocabulary and the same canonical
 * anchor — same four levels, same cross-translation matching — rather than
 * inventing a second one. `noteScope` is deliberately free of db imports, so
 * this is safe to pull into client components.
 */
export type ScriptureTargetType = NoteTargetType; // bible | book | chapter | verse
export const SCRIPTURE_TARGET_TYPES = NOTE_TARGET_TYPES;
export type ScriptureAnchor = NoteTargetInput;

/** Where a new contribution hangs: an entity section, or a point in scripture. */
export type ContributionTarget =
	| { kind: "entity"; entityId: string; section: ContributionSection }
	| ({ kind: "scripture" } & ScriptureAnchor);

export type ContributionKind = "comment" | "fact" | "analysis" | "correction";

export type Author = { id: string; name: string; username: string; profilePicture: string | null };

/**
 * What every post — contribution or comment — carries on top of its row, so the
 * client can render the two the same way.
 *
 * `deleted` is a tombstone: the author removed it, but a reply below it
 * survived, so the node is kept to hold the thread together. Its `body` and
 * `author` are blanked server-side — a deleted post's text never reaches the
 * browser. A removed post with nothing under it is dropped instead.
 */
export type PostMeta = {
	author: Author;
	userVote: number; // -1 | 0 | 1
	/** The caller wrote this, so they may delete it. False for anonymous readers. */
	isMine: boolean;
	deleted: boolean;
};

/** A comment plus its author, the caller's vote, and nested replies (full depth). */
export type CommentNode = CommunityComment & PostMeta & {
	replies: CommentNode[];
};

export type ContributionFull = Contribution & PostMeta & {
	comments: CommentNode[];
};

/** All published contributions for an entity, grouped by the AI section they augment. */
export type CommunityData = Record<ContributionSection, ContributionFull[]>;

/**
 * Every published thread visible while reading one chapter: the chapter's own,
 * its verses', and the book- and bible-level ones above it.
 *
 * Flat rather than grouped server-side. The entity page needs a fixed bucket
 * per known section even when empty; scripture has one fixed level (chapter)
 * and N dynamic ones (whichever verses happen to have threads), so the panel
 * groups client-side the way NotesSection already does.
 */
export type ScriptureCommunityData = {
	contributions: ContributionFull[];
	/** Canonical book abbreviation -> reader link parts, for resolving citations. */
	linkMap: Record<string, { bibleSlug: string; bookSlug: string }>;
};
