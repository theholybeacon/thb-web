import { timingSafeEqual } from "crypto";

/**
 * API-key auth for the Content API.
 *
 * The key lives in an env var, exactly like CRON_SECRET and
 * EMAIL_UNSUBSCRIBE_SECRET — there is no key table and no schema change.
 * Comparison is constant-time, mirroring verifyUnsubscribeToken in
 * src/lib/emailTokens.ts.
 *
 *   CONTENT_API_KEY="s3cret"
 *
 * One secret, no labels and no list: this API has a single consumer, and the
 * rate limit and hydration budget are brakes on the API as a whole rather than
 * per-client quotas.
 *
 * FAILS CLOSED: an unset or empty variable rejects every request. That is the
 * safe direction — the alternative would silently publish the whole catalogue
 * the first time someone forgot to set an env var in a new environment.
 */

export const API_KEY_HEADER = "x-api-key";

function configuredKey(): string | null {
	return process.env.CONTENT_API_KEY?.trim() || null;
}

function constantTimeEquals(a: string, b: string): boolean {
	const bufA = Buffer.from(a, "utf8");
	const bufB = Buffer.from(b, "utf8");
	// Length is not secret, and timingSafeEqual throws on a length mismatch.
	if (bufA.length !== bufB.length) return false;
	return timingSafeEqual(bufA, bufB);
}

/** True when the request presents the configured key. */
export function authenticate(request: Request): boolean {
	const presented = request.headers.get(API_KEY_HEADER)?.trim();
	const expected = configuredKey();
	if (!presented || !expected) return false;
	return constantTimeEquals(expected, presented);
}
