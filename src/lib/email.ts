import { Resend } from "resend";
import { logger } from "@/app/utils/logger";

const log = logger.child({ module: "Email" });

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || "The Holy Beacon <noreply@theholybeacon.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://theholybeacon.com";

interface SendEmailParams {
	to: string;
	subject: string;
	html: string;
}

async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
	if (!process.env.RESEND_API_KEY) {
		log.warn("RESEND_API_KEY not configured, skipping email");
		return false;
	}

	try {
		const { error } = await resend.emails.send({
			from: FROM_EMAIL,
			to,
			subject,
			html,
		});

		if (error) {
			log.error({ error, to, subject }, "Failed to send email");
			return false;
		}

		log.info({ to, subject }, "Email sent successfully");
		return true;
	} catch (error) {
		log.error({ error, to, subject }, "Error sending email");
		return false;
	}
}

/**
 * Send email to recipient when they receive a gift subscription
 */
export async function sendGiftReceivedEmail({
	recipientEmail,
	recipientName,
	gifterName,
	billingInterval,
	claimToken,
}: {
	recipientEmail: string;
	recipientName?: string;
	gifterName: string;
	billingInterval: string;
	claimToken: string;
}): Promise<boolean> {
	const claimUrl = `${APP_URL}/gift/claim/${claimToken}`;
	const planName = billingInterval === "year" ? "yearly" : "monthly";
	const greeting = recipientName ? `Hi ${recipientName}` : "Hello";

	const html = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="text-align: center; margin-bottom: 30px;">
		<h1 style="color: #7c3aed; margin: 0;">The Holy Beacon</h1>
	</div>

	<div style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); border-radius: 12px; padding: 30px; text-align: center; color: white; margin-bottom: 30px;">
		<h2 style="margin: 0 0 10px 0; font-size: 24px;">You've Received a Gift!</h2>
		<p style="margin: 0; opacity: 0.9;">A Premium subscription is waiting for you</p>
	</div>

	<p>${greeting},</p>

	<p><strong>${gifterName}</strong> has gifted you a <strong>${planName} Premium subscription</strong> to The Holy Beacon!</p>

	<p>With Premium, you'll get access to:</p>
	<ul style="padding-left: 20px;">
		<li>AI-powered Bible study creation</li>
		<li>Unlimited study sessions</li>
		<li>Full access to all features</li>
	</ul>

	<div style="text-align: center; margin: 30px 0;">
		<a href="${claimUrl}" style="display: inline-block; background: #7c3aed; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">Claim Your Gift</a>
	</div>

	<p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
	<p style="color: #7c3aed; font-size: 14px; word-break: break-all;">${claimUrl}</p>

	<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

	<p style="color: #999; font-size: 12px; text-align: center;">
		This email was sent by The Holy Beacon.<br>
		If you didn't expect this gift, you can safely ignore this email.
	</p>
</body>
</html>
`;

	return sendEmail({
		to: recipientEmail,
		subject: `${gifterName} gifted you Premium access to The Holy Beacon!`,
		html,
	});
}

/**
 * Send email to recipient when their sponsorship request is fulfilled
 */
export async function sendSponsorshipFulfilledEmail({
	recipientEmail,
	recipientName,
	sponsorName,
	billingInterval,
}: {
	recipientEmail: string;
	recipientName: string;
	sponsorName: string;
	billingInterval: string;
}): Promise<boolean> {
	const planName = billingInterval === "year" ? "yearly" : "monthly";

	const html = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="text-align: center; margin-bottom: 30px;">
		<h1 style="color: #7c3aed; margin: 0;">The Holy Beacon</h1>
	</div>

	<div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 30px; text-align: center; color: white; margin-bottom: 30px;">
		<h2 style="margin: 0 0 10px 0; font-size: 24px;">You're Now Premium!</h2>
		<p style="margin: 0; opacity: 0.9;">Your sponsorship request has been fulfilled</p>
	</div>

	<p>Hi ${recipientName},</p>

	<p>Great news! <strong>${sponsorName}</strong> has sponsored your <strong>${planName} Premium subscription</strong> to The Holy Beacon!</p>

	<p>Your Premium access is now active. You can immediately start enjoying:</p>
	<ul style="padding-left: 20px;">
		<li>AI-powered Bible study creation</li>
		<li>Unlimited study sessions</li>
		<li>Full access to all features</li>
	</ul>

	<div style="text-align: center; margin: 30px 0;">
		<a href="${APP_URL}/study/create" style="display: inline-block; background: #7c3aed; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">Start Your First Study</a>
	</div>

	<p>Consider reaching out to thank <strong>${sponsorName}</strong> for their generosity in supporting your spiritual journey!</p>

	<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

	<p style="color: #999; font-size: 12px; text-align: center;">
		This email was sent by The Holy Beacon.<br>
		You received this because your sponsorship request was fulfilled.
	</p>
</body>
</html>
`;

	return sendEmail({
		to: recipientEmail,
		subject: `${sponsorName} has sponsored your Premium subscription!`,
		html,
	});
}

/**
 * Send email when an email gift is claimed (confirmation to the recipient)
 */
export async function sendGiftClaimedEmail({
	recipientEmail,
	recipientName,
	gifterName,
	billingInterval,
}: {
	recipientEmail: string;
	recipientName: string;
	gifterName: string;
	billingInterval: string;
}): Promise<boolean> {
	const planName = billingInterval === "year" ? "yearly" : "monthly";

	const html = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="text-align: center; margin-bottom: 30px;">
		<h1 style="color: #7c3aed; margin: 0;">The Holy Beacon</h1>
	</div>

	<div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px; padding: 30px; text-align: center; color: white; margin-bottom: 30px;">
		<h2 style="margin: 0 0 10px 0; font-size: 24px;">Welcome to Premium!</h2>
		<p style="margin: 0; opacity: 0.9;">Your gift has been claimed</p>
	</div>

	<p>Hi ${recipientName},</p>

	<p>You've successfully claimed your <strong>${planName} Premium subscription</strong> gift from <strong>${gifterName}</strong>!</p>

	<p>Your Premium access is now active. Start exploring:</p>
	<ul style="padding-left: 20px;">
		<li>AI-powered Bible study creation</li>
		<li>Unlimited study sessions</li>
		<li>Full access to all features</li>
	</ul>

	<div style="text-align: center; margin: 30px 0;">
		<a href="${APP_URL}/study/create" style="display: inline-block; background: #7c3aed; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600;">Create Your First Study</a>
	</div>

	<p>Don't forget to thank <strong>${gifterName}</strong> for their thoughtful gift!</p>

	<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

	<p style="color: #999; font-size: 12px; text-align: center;">
		This email was sent by The Holy Beacon.<br>
		You received this because you claimed a gift subscription.
	</p>
</body>
</html>
`;

	return sendEmail({
		to: recipientEmail,
		subject: `Welcome to Premium! Thank ${gifterName} for your gift`,
		html,
	});
}
