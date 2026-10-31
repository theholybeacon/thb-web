import { describe, expect, it } from "vitest";
import { isPremiumUser, isWelcomePremiumActive, isWelcomePremiumClaimable } from "./premium";

const now = new Date("2026-11-01T12:00:00Z");
const tomorrow = new Date("2026-11-02T12:00:00Z");
const yesterday = new Date("2026-10-31T12:00:00Z");

describe("isWelcomePremiumActive", () => {
	it("runs until its end date", () => {
		expect(isWelcomePremiumActive(tomorrow, now)).toBe(true);
		expect(isWelcomePremiumActive(yesterday, now)).toBe(false);
	});

	it("is off when never granted", () => {
		expect(isWelcomePremiumActive(null, now)).toBe(false);
		expect(isWelcomePremiumActive(undefined, now)).toBe(false);
	});

	it("reads the ISO string a cached user row carries", () => {
		expect(isWelcomePremiumActive(tomorrow.toISOString(), now)).toBe(true);
	});
});

describe("isPremiumUser", () => {
	it("counts a running welcome week as premium", () => {
		expect(isPremiumUser({ welcomePremiumEndsAt: new Date(Date.now() + 60_000) })).toBe(true);
	});

	it("drops premium once the welcome week is over", () => {
		expect(isPremiumUser({ welcomePremiumEndsAt: new Date(Date.now() - 60_000) })).toBe(false);
	});

	it("keeps the Stripe and lifetime ways to premium", () => {
		expect(isPremiumUser({ status: "active" })).toBe(true);
		expect(isPremiumUser({ status: "trialing" })).toBe(true);
		expect(isPremiumUser({ status: "canceled" })).toBe(false);
		expect(isPremiumUser({ lifetimePremium: true })).toBe(true);
	});
});

describe("isWelcomePremiumClaimable", () => {
	it("is claimable by a free reader who never had it", () => {
		expect(isWelcomePremiumClaimable({})).toBe(true);
		expect(isWelcomePremiumClaimable({ status: "canceled" })).toBe(true);
	});

	it("is never claimed twice, even after it ran out", () => {
		expect(isWelcomePremiumClaimable({ welcomePremiumEndsAt: yesterday })).toBe(false);
	});

	it("is not given to subscribers or lifetime readers", () => {
		expect(isWelcomePremiumClaimable({ status: "active" })).toBe(false);
		expect(isWelcomePremiumClaimable({ status: "trialing" })).toBe(false);
		expect(isWelcomePremiumClaimable({ lifetimePremium: true })).toBe(false);
	});
});
