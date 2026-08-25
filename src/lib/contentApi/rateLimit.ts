/**
 * Per-key request throttling for the Content API.
 *
 * This repo has no HTTP rate limiter to be consistent with — middleware does
 * auth only, and the single existing throttle is a 20-second per-user cooldown
 * inside contributionCreateSS. So this is deliberately the smallest thing that
 * works: an in-process token bucket, no new dependency, nothing shared.
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

const buckets = new Map<string, Bucket>();

function limitPerMinute(): number {
	const configured = Number(process.env.CONTENT_API_RATE_LIMIT_PER_MINUTE);
	return Number.isFinite(configured) && configured > 0 ? configured : 60;
}

export function checkRateLimit(key: string, nowMs: number = Date.now()): RateLimitDecision {
	const limit = limitPerMinute();
	const refillPerMs = limit / 60_000;

	const bucket = buckets.get(key) ?? { tokens: limit, lastRefillMs: nowMs };

	// Continuous refill rather than fixed windows: a fixed window lets a client
	// spend 2x the limit across a window boundary.
	const elapsed = Math.max(0, nowMs - bucket.lastRefillMs);
	bucket.tokens = Math.min(limit, bucket.tokens + elapsed * refillPerMs);
	bucket.lastRefillMs = nowMs;

	if (bucket.tokens < 1) {
		const waitMs = (1 - bucket.tokens) / refillPerMs;
		buckets.set(key, bucket);
		return {
			allowed: false,
			retryAfterSeconds: Math.max(1, Math.ceil(waitMs / 1000)),
			remaining: 0,
			limit,
		};
	}

	bucket.tokens -= 1;
	buckets.set(key, bucket);
	return {
		allowed: true,
		retryAfterSeconds: 0,
		remaining: Math.floor(bucket.tokens),
		limit,
	};
}

/** Test seam. Never called at runtime. */
export function __resetRateLimits(): void {
	buckets.clear();
}
