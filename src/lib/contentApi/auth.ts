import { timingSafeEqual } from "crypto";

/**
 * API-key auth for the Content API.
 *
 * Keys live in an env var, exactly like CRON_SECRET and EMAIL_UNSUBSCRIBE_SECRET
 * — there is no key table and no schema change. Comparison is constant-time,
 * mirroring verifyUnsubscribeToken in src/lib/emailTokens.ts.
 *
 *   CONTENT_API_KEYS="marketing:s3cret,localdev:anothersecret"
 *
 * The label is not a security boundary; it exists so rate limits and hydration
 * budgets are per-consumer and so logs say WHICH client is misbehaving.
 *
 * FAILS CLOSED: an unset or empty variable rejects every request. That is the
 * safe direction — the alternative would silently publish the whole catalogue
 * the first time someone forgot to set an env var in a new environment.
 */

export type ApiKeyIdentity = { label: string };

export const API_KEY_HEADER = "x-api-key";

type ParsedKey = { label: string; secret: string };

function parseKeys(): ParsedKey[] {
	const raw = process.env.CONTENT_API_KEYS?.trim();
	if (!raw) return [];

	return raw
		.split(",")
		.map((entry) => entry.trim())
		.filter(Boolean)
		.map((entry) => {
			// Only the FIRST colon separates label from secret, so a secret may
			// itself contain colons without being silently truncated.
			const idx = entry.indexOf(":");
			if (idx <= 0 || idx === entry.length - 1) return null;
			return { label: entry.slice(0, idx), secret: entry.slice(idx + 1) };
		})
		.filter((k): k is ParsedKey => k !== null);
}

function constantTimeEquals(a: string, b: string): boolean {
	const bufA = Buffer.from(a, "utf8");
	const bufB = Buffer.from(b, "utf8");
	// Length is not secret, and timingSafeEqual throws on a length mismatch.
	if (bufA.length !== bufB.length) return false;
	return timingSafeEqual(bufA, bufB);
}

/** The caller behind this request, or null when the key is missing or wrong. */
export function authenticate(request: Request): ApiKeyIdentity | null {
	const presented = request.headers.get(API_KEY_HEADER)?.trim();
	if (!presented) return null;

	// Every configured key is compared, with no early exit, so the response time
	// does not reveal how many keys exist or where a near-match sat in the list.
	let match: ApiKeyIdentity | null = null;
	for (const key of parseKeys()) {
		if (constantTimeEquals(key.secret, presented)) match = { label: key.label };
	}
	return match;
}

/** True when at least one usable key is configured. Used by /meta diagnostics. */
export function hasConfiguredKeys(): boolean {
	return parseKeys().length > 0;
}
