import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const captureExceptionImmediate = vi.fn();
vi.mock("posthog-node", () => ({
	PostHog: vi.fn(() => ({ captureExceptionImmediate })),
}));

const KEY = "phc_test";

beforeEach(() => {
	vi.resetModules();
	captureExceptionImmediate.mockReset();
	vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", KEY);
});

afterEach(() => {
	vi.unstubAllEnvs();
});

describe("distinctIdFromCookies", () => {
	const cookie = (id: string) => `ph_${KEY}_posthog=${encodeURIComponent(JSON.stringify({ distinct_id: id }))}`;

	it("finds the person PostHog's browser cookie names", async () => {
		const { distinctIdFromCookies } = await import("./server-errors");
		expect(distinctIdFromCookies(`theme=dark; ${cookie("user-42")}; __session=abc`)).toBe("user-42");
	});

	it("answers undefined without the cookie, or when it isn't PostHog's JSON", async () => {
		const { distinctIdFromCookies } = await import("./server-errors");
		expect(distinctIdFromCookies(undefined)).toBeUndefined();
		expect(distinctIdFromCookies("theme=dark")).toBeUndefined();
		expect(distinctIdFromCookies(`ph_${KEY}_posthog=not-json`)).toBeUndefined();
		// Another PostHog project's cookie belongs to someone else's analytics.
		expect(distinctIdFromCookies(`ph_other_posthog=${encodeURIComponent('{"distinct_id":"x"}')}`)).toBeUndefined();
	});
});

describe("reportServerError", () => {
	it("sends the error with its digest as the reference the user sees", async () => {
		const { reportServerError } = await import("./server-errors");
		const error = Object.assign(new Error("boom"), { digest: "12345" });
		await reportServerError(error, { distinctId: "user-42", path: "/home" });
		expect(captureExceptionImmediate).toHaveBeenCalledWith(
			error,
			"user-42",
			expect.objectContaining({ error_ref: "12345", path: "/home" }),
		);
	});

	it("does nothing when PostHog isn't configured", async () => {
		vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "");
		const { reportServerError } = await import("./server-errors");
		await reportServerError(new Error("boom"));
		expect(captureExceptionImmediate).not.toHaveBeenCalled();
	});

	it("never throws when reporting itself fails", async () => {
		captureExceptionImmediate.mockRejectedValueOnce(new Error("PostHog is down"));
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
		const { reportServerError } = await import("./server-errors");
		await expect(reportServerError(new Error("boom"))).resolves.toBeUndefined();
		consoleError.mockRestore();
	});
});
