import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { userTable } from "@/db/schema/user";
import { subscriptionTable } from "@/db/schema/subscription";
import { emailSendLogTable } from "@/db/schema/emailSendLog";
import { ClaimedSend, EmailCandidate, EmailKind, EmailSendStatus } from "../model/Notification";

export class NotificationPostgreSQLDao {
	/**
	 * Everyone who could receive a lifecycle email today, with their subscription
	 * in the same round trip. `subscription.userId` is unique, so the left join
	 * yields at most one row per user.
	 */
	async getCandidates(limit: number): Promise<EmailCandidate[]> {
		return await db
			.select({
				id: userTable.id,
				name: userTable.name,
				email: userTable.email,
				timezone: userTable.timezone,
				defaultBibleId: userTable.defaultBibleId,
				subscriptionStatus: subscriptionTable.status,
				currentPeriodEnd: subscriptionTable.currentPeriodEnd,
			})
			.from(userTable)
			.leftJoin(subscriptionTable, eq(subscriptionTable.userId, userTable.id))
			.where(eq(userTable.emailRemindersEnabled, true))
			.limit(limit);
	}

	/**
	 * Claim a batch of sends in ONE statement. Rows that collide with the
	 * (userId, kind, sendDate) unique constraint are silently dropped, so a
	 * duplicate cron firing claims nothing and sends nothing. Only the rows
	 * returned here are ours to send.
	 */
	async claimSends(rows: { userId: string; kind: EmailKind; sendDate: string }[]): Promise<ClaimedSend[]> {
		if (rows.length === 0) return [];

		return await db
			.insert(emailSendLogTable)
			.values(rows.map((r) => ({ ...r, status: "claimed" as const })))
			.onConflictDoNothing()
			.returning({
				id: emailSendLogTable.id,
				userId: emailSendLogTable.userId,
				kind: emailSendLogTable.kind,
			});
	}

	async markStatus(ids: string[], status: EmailSendStatus, error?: string): Promise<void> {
		if (ids.length === 0) return;
		await db
			.update(emailSendLogTable)
			.set({ status, error: error ?? null })
			.where(inArray(emailSendLogTable.id, ids));
	}
}
