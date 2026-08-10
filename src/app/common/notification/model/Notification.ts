import { emailSendLogTable } from "@/db/schema/emailSendLog";

export type EmailSendLog = typeof emailSendLogTable.$inferSelect;
export type EmailSendLogInsert = typeof emailSendLogTable.$inferInsert;

export type EmailKind = EmailSendLog["kind"];
export type EmailSendStatus = EmailSendLog["status"];

/** A user eligible for a lifecycle email, joined with their subscription. */
export type EmailCandidate = {
	id: string;
	name: string;
	email: string;
	timezone: string | null;
	defaultBibleId: string | null;
	subscriptionStatus: string | null;
	/** While a Stripe sub is `trialing`, current_period_end IS the trial end. */
	currentPeriodEnd: Date | null;
};

/** A send this run successfully claimed (i.e. no other run already owns it). */
export type ClaimedSend = {
	id: string;
	userId: string;
	kind: EmailKind;
};

export type SweepResult = {
	considered: number;
	skippedOutOfWindow: number;
	skippedActiveToday: number;
	skippedAlreadySent: number;
	sent: Record<EmailKind, number>;
	failed: number;
	droppedByCap: number;
};
