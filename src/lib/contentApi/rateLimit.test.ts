import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { __resetRateLimits, checkRateLimit } from "./rateLimit";

const ORIGINAL = process.env.CONTENT_API_RATE_LIMIT_PER_MINUTE;

beforeEach(() => {
	__resetRateLimits();
	process.env.CONTENT_API_RATE_LIMIT_PER_MINUTE = "10";
});
afterEach(() => {
	if (ORIGINAL === undefined) delete process.env.CONTENT_API_RATE_LIMIT_PER_MINUTE;
	else process.env.CONTENT_API_RATE_LIMIT_PER_MINUTE = ORIGINAL;
});

describe("checkRateLimit", () => {
	it("allows up to the limit, then refuses with a usable Retry-After", () => {
		const now = 1_000_000;
		for (let i = 0; i < 10; i++) {
			expect(checkRateLimit(now).allowed).toBe(true);
		}
		const blocked = checkRateLimit(now);
		expect(blocked.allowed).toBe(false);
		expect(blocked.remaining).toBe(0);
		expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
	});

	it("refills continuously rather than in fixed windows", () => {
		const now = 1_000_000;
		for (let i = 0; i < 10; i++) checkRateLimit(now);
		expect(checkRateLimit(now).allowed).toBe(false);

		// 10/min = one token every 6s. A fixed window would grant the whole
		// allowance at once here and permit a 2x burst across the boundary.
		expect(checkRateLimit(now + 6_000).allowed).toBe(true);
		expect(checkRateLimit(now + 6_000).allowed).toBe(false);
	});

	it("never refills beyond the limit no matter how long it idles", () => {
		const now = 1_000_000;
		checkRateLimit(now);
		const after = checkRateLimit(now + 86_400_000);
		expect(after.remaining).toBeLessThanOrEqual(after.limit - 1);
	});

	it("falls back to a sane default when misconfigured", () => {
		process.env.CONTENT_API_RATE_LIMIT_PER_MINUTE = "not-a-number";
		expect(checkRateLimit().limit).toBe(60);
	});
});
