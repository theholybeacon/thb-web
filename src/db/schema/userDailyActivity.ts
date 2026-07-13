import { AnyPgColumn, date, index, pgTable, timestamp, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { userTable } from "./user";

/**
 * One row per user per calendar day they engaged — the substrate for streaks.
 * `activityDate` is the user's LOCAL date (YYYY-MM-DD) so streak boundaries
 * match the user's day without storing a timezone.
 */
export const userDailyActivityTable = pgTable("user_daily_activity", {
	id: uuid().defaultRandom().primaryKey(),
	userId: uuid().references((): AnyPgColumn => userTable.id).notNull(),
	activityDate: date({ mode: "string" }).notNull(),
	source: varchar({ length: 20 }), // study | read | verse (first trigger of the day)
	createdAt: timestamp().notNull().defaultNow(),
}, (t) => ({
	uniqueDay: unique("user_daily_activity_unique").on(t.userId, t.activityDate),
	userIdx: index("user_daily_activity_user_idx").on(t.userId),
}));

export const insertUserDailyActivitySchema = createInsertSchema(userDailyActivityTable);
export const selectUserDailyActivitySchema = createSelectSchema(userDailyActivityTable);
