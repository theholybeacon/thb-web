import { AnyPgColumn, index, pgEnum, pgTable, smallint, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { userTable } from "./user";

export const voteTargetEnum = pgEnum("vote_target_type", ["contribution", "comment"]);

/** A single up/down vote by a user on a contribution or comment (one per user per target). */
export const communityVoteTable = pgTable("community_vote", {
	id: uuid().defaultRandom().primaryKey(),
	targetType: voteTargetEnum().notNull(),
	targetId: uuid().notNull(),
	userId: uuid().references((): AnyPgColumn => userTable.id).notNull(),
	value: smallint().notNull(), // +1 or -1
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
}, (t) => ({
	uniqueVote: unique("community_vote_unique").on(t.targetType, t.targetId, t.userId),
	targetIdx: index("community_vote_target_idx").on(t.targetType, t.targetId),
}));

export const insertCommunityVoteSchema = createInsertSchema(communityVoteTable);
export const selectCommunityVoteSchema = createSelectSchema(communityVoteTable);
