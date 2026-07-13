import { AnyPgColumn, index, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { contributionTable } from "./contribution";
import { userTable } from "./user";

export const commentStatusEnum = pgEnum("comment_status", ["published", "removed"]);

/** A fully-nestable comment on a contribution (parentCommentId links a reply to its parent). */
export const communityCommentTable = pgTable("community_comment", {
	id: uuid().defaultRandom().primaryKey(),
	contributionId: uuid().references((): AnyPgColumn => contributionTable.id).notNull(),
	parentCommentId: uuid(), // nullable; self-reference resolved in application code
	userId: uuid().references((): AnyPgColumn => userTable.id).notNull(),
	body: text().notNull(),
	score: integer().notNull().default(0),
	status: commentStatusEnum().notNull().default("published"),
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp().notNull().defaultNow(),
}, (t) => ({
	contributionIdx: index("community_comment_contribution_idx").on(t.contributionId),
}));

export const communityCommentRelations = relations(communityCommentTable, ({ one }) => ({
	contribution: one(contributionTable, {
		fields: [communityCommentTable.contributionId],
		references: [contributionTable.id],
	}),
	author: one(userTable, { fields: [communityCommentTable.userId], references: [userTable.id] }),
}));

export const insertCommunityCommentSchema = createInsertSchema(communityCommentTable);
export const selectCommunityCommentSchema = createSelectSchema(communityCommentTable);
