import { createHmac, timingSafeEqual } from "crypto";

/**
 * Unsubscribe links must work from a mail client, with no session. So the link
 * carries the user id plus an HMAC of it — unforgeable without the secret, and
 * stateless (no token column, nothing to expire or clean up).
 */
function secret(): string {
	const s = process.env.EMAIL_UNSUBSCRIBE_SECRET;
	if (!s) throw new Error("EMAIL_UNSUBSCRIBE_SECRET is not set");
	return s;
}

export function signUnsubscribeToken(userId: string): string {
	return createHmac("sha256", secret()).update(userId).digest("hex");
}

export function verifyUnsubscribeToken(userId: string, token: string): boolean {
	let expected: string;
	try {
		expected = signUnsubscribeToken(userId);
	} catch {
		return false;
	}
	const a = Buffer.from(expected, "utf8");
	const b = Buffer.from(token, "utf8");
	if (a.length !== b.length) return false;
	return timingSafeEqual(a, b);
}

export function unsubscribeUrl(appUrl: string, userId: string): string {
	const t = signUnsubscribeToken(userId);
	return `${appUrl}/api/email/unsubscribe?u=${encodeURIComponent(userId)}&t=${t}`;
}
