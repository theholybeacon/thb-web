import "server-only";

import { logger } from "@/app/utils/logger";
import { NotificationRepository } from "../../repository/NotificationRepository";
import { ActivityRepository } from "../../../activity/repository/ActivityRepository";
import { addDays, computeStreak } from "../../../activity/model/streak";
import { dailyVerseGetSS, type DailyVerse } from "../../../dailyVerse/service/server/dailyVerseGetSS";
import { EmailCandidate, EmailKind, SweepResult } from "../../model/Notification";
import { isInSendWindow, localDateInTz, localHourInTz, safeTimezone } from "@/lib/notificationSchedule";
import { unsubscribeUrl } from "@/lib/emailTokens";
import { APP_URL, BatchMessage, EMAIL_BATCH_LIMIT, sendEmailBatch } from "@/lib/email";
import { dailyVerseEmail, streakAtRiskEmail, trialEndingEmail, type EmailContent } from "@/lib/emailTemplates";

const log = logger.child({ module: "dailyEmailSweep" });

/**
 * Upper bound on users touched in one run, so we can't blow the function's time
 * cap (60s on Hobby — see the route's maxDuration).
 *
 * 2000 was sized against a mistaken 300s budget. It is far above current usage,
 * so it is left as-is; revisit it before the user base approaches this number,
 * or shard the sweep across several cron runs.
 */
const RUN_CAP = 2000;
/** A streak this long is worth an email to rescue. */
const STREAK_AT_RISK_MIN = 3;
/** Warn about a trial ending within this window. */
const TRIAL_ENDING_WINDOW_MS = 48 * 60 * 60 * 1000;
const ACTIVITY_LOOKBACK_DAYS = 40;
const DAY_MS = 24 * 60 * 60 * 1000;

type Plan = {
	user: EmailCandidate;
	kind: EmailKind;
	localDate: string;
	streak: number;
	verse: DailyVerse | null;
};

/**
 * Pick the ONE email this user should get today. A user mid-trial with a dying
 * streak gets the trial email only — never three emails in one morning.
 */
function pickKind(user: EmailCandidate, streak: number, now: Date): EmailKind {
	if (user.subscriptionStatus === "trialing" && user.currentPeriodEnd) {
		// While a Stripe sub is `trialing`, current_period_end IS the trial end.
		const remaining = user.currentPeriodEnd.getTime() - now.getTime();
		if (remaining > 0 && remaining <= TRIAL_ENDING_WINDOW_MS) return "trial_ending";
	}
	if (streak >= STREAK_AT_RISK_MIN) return "streak_at_risk";
	return "daily_reminder";
}

function verseUrl(verse: DailyVerse | null): string {
	if (!verse?.bibleSlug || !verse.bookSlug) return `${APP_URL}/home`;
	return `${APP_URL}/bible/${verse.bibleSlug}/${verse.bookSlug}/${verse.chapter}#verse-${verse.verse}`;
}

function render(plan: Plan, now: Date): EmailContent {
	const unsub = unsubscribeUrl(APP_URL, plan.user.id);
	const name = plan.user.name?.split(" ")[0] || "friend";

	switch (plan.kind) {
		case "trial_ending": {
			const ms = (plan.user.currentPeriodEnd?.getTime() ?? now.getTime()) - now.getTime();
			return trialEndingEmail({
				name,
				daysLeft: Math.max(1, Math.ceil(ms / DAY_MS)),
				billingUrl: `${APP_URL}/subscription`,
				unsubscribeUrl: unsub,
			});
		}
		case "streak_at_risk":
			return streakAtRiskEmail({
				name,
				streak: plan.streak,
				verse: plan.verse,
				verseUrl: verseUrl(plan.verse),
				unsubscribeUrl: unsub,
			});
		case "daily_reminder":
			// Guaranteed non-null: verse-less daily_reminder plans are dropped before this.
			return dailyVerseEmail({
				name,
				verse: plan.verse!,
				verseUrl: verseUrl(plan.verse),
				unsubscribeUrl: unsub,
			});
	}
}

/**
 * The daily lifecycle-email sweep, invoked by the Vercel cron route.
 *
 * NOT a Server Action (no "use server"): a Server Action is a publicly callable
 * endpoint, which would let anyone on the internet trigger the email blast. The
 * CRON_SECRET check in the route is the only way in.
 *
 * Vercel cron delivery is best-effort — a run can be missed OR fired twice, and
 * failures are never retried — so every send is claimed against a UNIQUE
 * (userId, kind, sendDate) row first. A duplicate run claims nothing and
 * therefore sends nothing.
 */
export async function dailyEmailSweep(): Promise<SweepResult> {
	const now = new Date();
	const notifications = new NotificationRepository();
	const activity = new ActivityRepository();

	const result: SweepResult = {
		considered: 0,
		skippedOutOfWindow: 0,
		skippedActiveToday: 0,
		skippedAlreadySent: 0,
		sent: { daily_reminder: 0, streak_at_risk: 0, trial_ending: 0 },
		failed: 0,
		droppedByCap: 0,
	};

	// Fetch one over the cap so we can tell whether we truncated.
	const candidates = await notifications.getCandidates(RUN_CAP + 1);
	const users = candidates.slice(0, RUN_CAP);
	if (candidates.length > RUN_CAP) {
		result.droppedByCap = candidates.length - RUN_CAP;
		log.warn(
			{ dropped: result.droppedByCap, cap: RUN_CAP },
			"run cap reached — these users get no email today; raise RUN_CAP or shard the sweep",
		);
	}
	result.considered = users.length;
	if (users.length === 0) return result;

	// All activity for all candidates in ONE query (no N+1 over the user list).
	// Widen the lookback by 2 days so every timezone's local window is covered.
	const since = addDays(now.toISOString().slice(0, 10), -(ACTIVITY_LOOKBACK_DAYS + 2));
	const activityByUser = await activity.getDatesForUsers(users.map((u) => u.id), since);

	// 1. Decide who gets what.
	const plans: Plan[] = [];
	for (const user of users) {
		const tz = safeTimezone(user.timezone);
		const localDate = localDateInTz(tz, now);

		if (!isInSendWindow(localHourInTz(tz, now))) {
			result.skippedOutOfWindow++;
			continue;
		}

		const dates = activityByUser.get(user.id) ?? [];
		// Never nag someone who already showed up today.
		if (dates.includes(localDate)) {
			result.skippedActiveToday++;
			continue;
		}

		const { current } = computeStreak(dates, localDate);
		plans.push({ user, kind: pickKind(user, current, now), localDate, streak: current, verse: null });
	}
	if (plans.length === 0) return result;

	// 2. Resolve the verse once per (date, translation) rather than per user.
	const verseCache = new Map<string, DailyVerse | null>();
	const needsVerse = (k: EmailKind) => k !== "trial_ending";
	for (const plan of plans) {
		if (!needsVerse(plan.kind)) continue;
		const key = `${plan.localDate}|${plan.user.defaultBibleId ?? ""}`;
		if (!verseCache.has(key)) {
			verseCache.set(key, await dailyVerseGetSS(plan.localDate, plan.user.defaultBibleId ?? undefined));
		}
		plan.verse = verseCache.get(key) ?? null;
	}

	// A daily_reminder with no verse has nothing to say — drop it rather than
	// send an empty email. (streak_at_risk still works verse-less.)
	const sendable = plans.filter((p) => {
		if (p.kind === "daily_reminder" && !p.verse) {
			log.warn({ userId: p.user.id, localDate: p.localDate }, "no daily verse resolved; skipping reminder");
			return false;
		}
		return true;
	});
	if (sendable.length === 0) return result;

	// 3. Claim every send in ONE statement. Only rows returned are ours to send;
	//    a concurrent/duplicate run collides on the unique constraint and gets none.
	const claimed = await notifications.claimSends(
		sendable.map((p) => ({ userId: p.user.id, kind: p.kind, sendDate: p.localDate })),
	);
	result.skippedAlreadySent = sendable.length - claimed.length;
	if (claimed.length === 0) return result;

	const planByUser = new Map(sendable.map((p) => [p.user.id, p]));

	// 4. Render + send in batches of EMAIL_BATCH_LIMIT.
	type Outgoing = { logId: string; kind: EmailKind; message: BatchMessage };
	const outgoing: Outgoing[] = [];
	for (const c of claimed) {
		const plan = planByUser.get(c.userId);
		if (!plan) continue;
		const { subject, html } = render(plan, now);
		outgoing.push({
			logId: c.id,
			kind: c.kind,
			message: {
				to: plan.user.email,
				subject,
				html,
				// Gmail/Yahoo bulk-sender rules require one-click unsubscribe;
				// without these headers this mail gets spam-foldered.
				headers: {
					"List-Unsubscribe": `<${unsubscribeUrl(APP_URL, plan.user.id)}>`,
					"List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
				},
			},
		});
	}

	for (let i = 0; i < outgoing.length; i += EMAIL_BATCH_LIMIT) {
		const chunk = outgoing.slice(i, i + EMAIL_BATCH_LIMIT);
		const ids = chunk.map((o) => o.logId);
		const { ok, error } = await sendEmailBatch(chunk.map((o) => o.message));

		if (ok) {
			await notifications.markStatus(ids, "sent");
			for (const o of chunk) result.sent[o.kind]++;
		} else {
			await notifications.markStatus(ids, "failed", error);
			result.failed += chunk.length;
		}
	}

	log.info(result, "daily email sweep complete");
	return result;
}
