import { userDailyActivityTable } from "@/db/schema/userDailyActivity";

export type UserDailyActivity = typeof userDailyActivityTable.$inferSelect;
export type UserDailyActivityInsert = typeof userDailyActivityTable.$inferInsert;

export type StreakInfo = {
	current: number;
	longest: number;
	todayDone: boolean;
};
