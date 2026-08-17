import { AnyPgColumn, index, pgTable, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { userTable } from "./user";

/**
 * A milestone a user has earned, recorded the first time it becomes true.
 *
 * The milestones themselves are DEFINED in code as pure predicates over
 * CompletionStats (see completion/model/badges.ts), so this table stores no
 * rules — only the moment. That moment is the point: it gives an `earnedAt`
 * date to show, and it is what lets us celebrate (and offer a share) exactly
 * when the badge is won rather than silently on some later page load.
 *
 * Written with onConflictDoNothing after each completion, so it is safe to
 * attempt on every write.
 */
export const userBadgeTable = pgTable("user_badge", {
	id: uuid().defaultRandom().primaryKey(),
	userId: uuid().references((): AnyPgColumn => userTable.id, { onDelete: "cascade" }).notNull(),
	badgeKey: varchar({ length: 50 }).notNull(),
	earnedAt: timestamp().notNull().defaultNow(),
}, (t) => ({
	userIdx: index("user_badge_user_idx").on(t.userId),
	userBadgeUnique: unique("user_badge_unique").on(t.userId, t.badgeKey),
}));

export const insertUserBadgeSchema = createInsertSchema(userBadgeTable);
export const selectUserBadgeSchema = createSelectSchema(userBadgeTable);
