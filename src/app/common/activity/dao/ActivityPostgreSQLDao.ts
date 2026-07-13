import { and, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { userDailyActivityTable } from "@/db/schema/userDailyActivity";

export class ActivityPostgreSQLDao {
	/** Mark a day active for a user; idempotent (one row per user per day). */
	async upsert(userId: string, activityDate: string, source: string | null): Promise<void> {
		await db
			.insert(userDailyActivityTable)
			.values({ userId, activityDate, source })
			.onConflictDoNothing();
	}

	/** All active dates (YYYY-MM-DD) for a user since `sinceDate`. */
	async getDates(userId: string, sinceDate: string): Promise<string[]> {
		const rows = await db
			.select({ d: userDailyActivityTable.activityDate })
			.from(userDailyActivityTable)
			.where(and(eq(userDailyActivityTable.userId, userId), gte(userDailyActivityTable.activityDate, sinceDate)));
		return rows.map((r) => r.d);
	}
}
