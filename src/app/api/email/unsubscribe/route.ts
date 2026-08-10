import type { NextRequest } from "next/server";
import { logger } from "@/app/utils/logger";
import { verifyUnsubscribeToken } from "@/lib/emailTokens";
import { UserRepository } from "@/app/common/user/repository/UserRepository";
import { APP_URL } from "@/lib/email";

const log = logger.child({ module: "unsubscribe" });

export const dynamic = "force-dynamic";

function page(title: string, message: string, ok: boolean): string {
	return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title}</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color:#333; max-width:520px; margin:80px auto; padding:0 20px; text-align:center;">
	<h1 style="color:#7c3aed; font-size:22px;">The Holy Beacon</h1>
	<h2 style="font-size:18px; color:${ok ? "#059669" : "#b91c1c"};">${title}</h2>
	<p style="color:#555; line-height:1.6;">${message}</p>
	<p><a href="${APP_URL}/home" style="color:#7c3aed;">Back to The Holy Beacon</a></p>
</body></html>`;
}

/**
 * Unsubscribe from reminder emails. Reachable with no session — it has to work
 * straight from a mail client — so authenticity comes from an HMAC of the user
 * id rather than a login.
 */
async function unsubscribe(request: NextRequest): Promise<boolean> {
	const userId = request.nextUrl.searchParams.get("u");
	const token = request.nextUrl.searchParams.get("t");
	if (!userId || !token || !verifyUnsubscribeToken(userId, token)) return false;

	try {
		await new UserRepository().setEmailReminders(userId, false);
		log.info({ userId }, "user unsubscribed from reminder emails");
		return true;
	} catch (error) {
		log.error({ error, userId }, "failed to unsubscribe user");
		return false;
	}
}

export async function GET(request: NextRequest) {
	const ok = await unsubscribe(request);
	const html = ok
		? page("You're unsubscribed", "You won't receive daily reminder emails anymore. You can turn them back on any time from your profile.", true)
		: page("That link didn't work", "This unsubscribe link is invalid or expired. You can turn reminders off from your profile instead.", false);

	return new Response(html, {
		status: ok ? 200 : 400,
		headers: { "content-type": "text/html; charset=utf-8" },
	});
}

/**
 * RFC 8058 one-click unsubscribe. Gmail and Yahoo POST here directly when the
 * user hits their native "unsubscribe" button, driven by the List-Unsubscribe
 * headers set on every reminder email.
 */
export async function POST(request: NextRequest) {
	const ok = await unsubscribe(request);
	return new Response(null, { status: ok ? 200 : 400 });
}
