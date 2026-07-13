import { contributionTable } from "@/db/schema/contribution";
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

export type Author = { id: string; name: string; username: string; profilePicture: string | null };

/** A comment plus its author, the caller's vote, and nested replies (full depth). */
export type CommentNode = CommunityComment & {
	author: Author;
	userVote: number; // -1 | 0 | 1
	replies: CommentNode[];
};

export type ContributionFull = Contribution & {
	author: Author;
	userVote: number;
	comments: CommentNode[];
};

/** All published contributions for an entity, grouped by the AI section they augment. */
export type CommunityData = Record<ContributionSection, ContributionFull[]>;
