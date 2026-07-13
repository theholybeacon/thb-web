import { AnyPgColumn, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { userTable } from "./user";
import { voteTargetEnum } from "./communityVote";

export const communityFlagStatusEnum = pgEnum("community_flag_status", ["open", "reviewed", "dismissed"]);

/** A user report that a contribution or comment is inaccurate/abusive. */
export const communityFlagTable = pgTable("community_flag", {
	id: uuid().defaultRandom().primaryKey(),
	targetType: voteTargetEnum().notNull(),
	targetId: uuid().notNull(),
	userId: uuid().references((): AnyPgColumn => userTable.id).notNull(),
	reason: text(),
	status: communityFlagStatusEnum().notNull().default("open"),
	createdAt: timestamp().notNull().defaultNow(),
});

export const insertCommunityFlagSchema = createInsertSchema(communityFlagTable);
export const selectCommunityFlagSchema = createSelectSchema(communityFlagTable);
