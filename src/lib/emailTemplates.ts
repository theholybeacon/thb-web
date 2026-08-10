import type { DailyVerse } from "@/app/common/dailyVerse/service/server/dailyVerseGetSS";

/**
 * Lifecycle email templates for the daily cron sweep. Inline-HTML, matching the
 * style of the existing transactional emails in `email.ts` (no React Email).
 */

const BRAND = "#7c3aed";

function layout({ heading, sub, gradient, body, cta, unsubscribeUrl }: {
	heading: string;
	sub: string;
	gradient: string;
	body: string;
	cta: { label: string; url: string };
	unsubscribeUrl: string;
}): string {
	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="text-align: center; margin-bottom: 30px;">
		<h1 style="color: ${BRAND}; margin: 0;">The Holy Beacon</h1>
	</div>

	<div style="background: ${gradient}; border-radius: 12px; padding: 30px; text-align: center; color: white; margin-bottom: 30px;">
		<h2 style="margin: 0 0 10px 0; font-size: 24px;">${heading}</h2>
		<p style="margin: 0; opacity: 0.9;">${sub}</p>
	</div>

	${body}

	<div style="text-align: center; margin: 30px 0;">
		<a href="${cta.url}" style="display: inline-block; background: ${BRAND}; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">${cta.label}</a>
	</div>

	<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

	<p style="color: #999; font-size: 12px; text-align: center;">
		You're receiving this because you have daily reminders on at The Holy Beacon.<br>
		<a href="${unsubscribeUrl}" style="color: #999;">Unsubscribe from reminders</a>
	</p>
</body>
</html>
`;
}

function verseBlock(verse: DailyVerse): string {
	return `
	<div style="border-left: 3px solid ${BRAND}; padding: 4px 0 4px 16px; margin: 24px 0;">
		<p style="margin: 0; font-size: 17px; line-height: 1.7;">${verse.text}</p>
		<p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">${verse.reference}</p>
	</div>`;
}

export interface EmailContent {
	subject: string;
	html: string;
}

export function dailyVerseEmail({ name, verse, verseUrl, unsubscribeUrl }: {
	name: string;
	verse: DailyVerse;
	verseUrl: string;
	unsubscribeUrl: string;
}): EmailContent {
	return {
		subject: `${verse.reference} — your verse for today`,
		html: layout({
			heading: "Your verse for today",
			sub: verse.reference,
			gradient: `linear-gradient(135deg, ${BRAND} 0%, #5b21b6 100%)`,
			body: `<p>Hi ${name},</p>${verseBlock(verse)}<p>Take a few minutes with it today.</p>`,
			cta: { label: "Read it in context", url: verseUrl },
			unsubscribeUrl,
		}),
	};
}

export function streakAtRiskEmail({ name, streak, verse, verseUrl, unsubscribeUrl }: {
	name: string;
	streak: number;
	verse: DailyVerse | null;
	verseUrl: string;
	unsubscribeUrl: string;
}): EmailContent {
	return {
		subject: `🔥 Your ${streak}-day streak ends tonight`,
		html: layout({
			heading: `${streak} days in a row`,
			sub: "Don't let it end tonight",
			gradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
			body: `<p>Hi ${name},</p>
	<p>You've studied <strong>${streak} days in a row</strong>. You haven't opened the Word today — a few minutes is all it takes to keep it going.</p>
	${verse ? verseBlock(verse) : ""}`,
			cta: { label: "Keep my streak alive", url: verseUrl },
			unsubscribeUrl,
		}),
	};
}

export function trialEndingEmail({ name, daysLeft, billingUrl, unsubscribeUrl }: {
	name: string;
	daysLeft: number;
	billingUrl: string;
	unsubscribeUrl: string;
}): EmailContent {
	const when = daysLeft <= 1 ? "tomorrow" : `in ${daysLeft} days`;
	return {
		subject: `Your Holy Beacon trial ends ${when}`,
		html: layout({
			heading: `Your trial ends ${when}`,
			sub: "Add a payment method to keep Premium",
			gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
			body: `<p>Hi ${name},</p>
	<p>Your free trial ends ${when}. You started it without a card, so <strong>nothing will be charged</strong> — but Premium will simply switch off unless you add a payment method.</p>
	<p>Keeping Premium means keeping:</p>
	<ul style="padding-left: 20px;">
		<li>AI-powered study plans</li>
		<li>Character pages, timelines and historical context</li>
		<li>Community insights and contributions</li>
	</ul>`,
			cta: { label: "Keep Premium", url: billingUrl },
			unsubscribeUrl,
		}),
	};
}
