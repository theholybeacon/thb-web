import { AnyPgColumn, index, pgEnum, pgTable, timestamp, unique, uuid, date, text } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { userTable } from "./user";

export const emailKindEnum = pgEnum("email_kind", ["daily_reminder", "streak_at_risk", "trial_ending"]);

export const emailSendStatusEnum = pgEnum("email_send_status", ["claimed", "sent", "failed"]);

/**
 * One row per (user, kind, day) — the idempotency guard for the daily cron.
 *
 * Vercel cron delivery is best-effort: a scheduled run can be missed OR fired
 * twice, and failures are never retried. The UNIQUE constraint below is what
 * makes a double-fired sweep send zero duplicate emails: the sweep claims a row
 * with ON CONFLICT DO NOTHING and only sends for rows it actually inserted.
 *
 * `sendDate` is the user's LOCAL date, matching `user_daily_activity`.
 */
export const emailSendLogTable = pgTable("email_send_log", {
	id: uuid().defaultRandom().primaryKey(),
	userId: uuid().references((): AnyPgColumn => userTable.id).notNull(),
	kind: emailKindEnum().notNull(),
	sendDate: date({ mode: "string" }).notNull(),
	status: emailSendStatusEnum().notNull().default("claimed"),
	error: text(),
	createdAt: timestamp().notNull().defaultNow(),
}, (t) => ({
	uniqueSend: unique("email_send_log_unique").on(t.userId, t.kind, t.sendDate),
	dateIdx: index("email_send_log_date_idx").on(t.sendDate),
}));

export const insertEmailSendLogSchema = createInsertSchema(emailSendLogTable);
export const selectEmailSendLogSchema = createSelectSchema(emailSendLogTable);
