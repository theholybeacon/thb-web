/**
 * Request throttling for the Content API.
 *
 * This repo has no HTTP rate limiter to be consistent with — middleware does
 * auth only, and the single existing throttle is a 20-second per-user cooldown
 * inside contributionCreateSS. So this is deliberately the smallest thing that
 * works: an in-process token bucket, no new dependency, nothing shared.
 *
 * One bucket for the whole API, not one per client: there is a single key and a
 * single consumer, so a per-caller quota would only ever have had one entry.
 *
 * HONEST LIMITATION: state lives in one server instance's memory. On serverless
 * each instance keeps its own bucket, so the effective ceiling is the configured
 * rate times the number of warm instances. It is a courtesy brake against a
 * runaway loop in the marketing pipeline, NOT a security control — the API key
 * is what keeps strangers out.
 */

export type RateLimitDecision = {
	allowed: boolean;
	/** Seconds until the next token, for the Retry-After header. */
	retryAfterSeconds: number;
	remaining: number;
	limit: number;
};

type Bucket = { tokens: number; lastRefillMs: number };

let bucket: Bucket | null = null;

function limitPerMinute(): number {
	const configured = Number(process.env.CONTENT_API_RATE_LIMIT_PER_MINUTE);
	return Number.isFinite(configured) && configured > 0 ? configured : 60;
}

export function checkRateLimit(nowMs: number = Date.now()): RateLimitDecision {
	const limit = limitPerMinute();
	const refillPerMs = limit / 60_000;

	bucket ??= { tokens: limit, lastRefillMs: nowMs };

	// Continuous refill rather than fixed windows: a fixed window lets a client
	// spend 2x the limit across a window boundary.
	const elapsed = Math.max(0, nowMs - bucket.lastRefillMs);
	bucket.tokens = Math.min(limit, bucket.tokens + elapsed * refillPerMs);
	bucket.lastRefillMs = nowMs;

	if (bucket.tokens < 1) {
		const waitMs = (1 - bucket.tokens) / refillPerMs;
		return {
			allowed: false,
			retryAfterSeconds: Math.max(1, Math.ceil(waitMs / 1000)),
			remaining: 0,
			limit,
		};
	}

	bucket.tokens -= 1;
	return {
		allowed: true,
		retryAfterSeconds: 0,
		remaining: Math.floor(bucket.tokens),
		limit,
	};
}

/** Test seam. Never called at runtime. */
export function __resetRateLimits(): void {
	bucket = null;
}
