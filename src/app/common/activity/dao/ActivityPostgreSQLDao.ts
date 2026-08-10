import { and, eq, gte, inArray } from "drizzle-orm";
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

	/**
	 * Active dates for many users in one query, grouped by user — so the daily
	 * email sweep can compute every streak without an N+1 over the user list.
	 */
	async getDatesForUsers(userIds: string[], sinceDate: string): Promise<Map<string, string[]>> {
		const grouped = new Map<string, string[]>();
		if (userIds.length === 0) return grouped;

		const rows = await db
			.select({ userId: userDailyActivityTable.userId, d: userDailyActivityTable.activityDate })
			.from(userDailyActivityTable)
			.where(
				and(
					inArray(userDailyActivityTable.userId, userIds),
					gte(userDailyActivityTable.activityDate, sinceDate),
				),
			);

		for (const r of rows) {
			const existing = grouped.get(r.userId);
			if (existing) existing.push(r.d);
			else grouped.set(r.userId, [r.d]);
		}
		return grouped;
	}
}
