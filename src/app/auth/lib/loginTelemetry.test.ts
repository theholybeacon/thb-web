import { beforeEach, describe, expect, it, vi } from "vitest";

const { capture, reportClientError } = vi.hoisted(() => ({ capture: vi.fn(), reportClientError: vi.fn() }));
vi.mock("posthog-js", () => ({ default: { capture } }));
vi.mock("@/lib/posthog-client", () => ({ reportClientError }));

import { clerkErrorOf, trackLoginFailure } from "./loginTelemetry";

beforeEach(() => {
	capture.mockReset();
	reportClientError.mockReset();
});

describe("clerkErrorOf", () => {
	it("reads the code of Clerk's first API error", () => {
		const err = { errors: [{ code: "form_password_incorrect", message: "short", longMessage: "long" }] };
		expect(clerkErrorOf(err)).toEqual({ code: "form_password_incorrect", message: "long" });
	});

	it("answers undefined when Clerk never answered (offline, blocked)", () => {
		expect(clerkErrorOf(new TypeError("Failed to fetch"))).toBeUndefined();
		expect(clerkErrorOf(null)).toBeUndefined();
	});
});

describe("trackLoginFailure", () => {
	it("counts a wrong password as an expected failure, not an error", () => {
		trackLoginFailure({ method: "password", stage: "credentials", reason: "form_password_incorrect" });
		expect(capture).toHaveBeenCalledWith("login_failed", {
			method: "password",
			stage: "credentials",
			reason: "form_password_incorrect",
			expected: true,
		});
		expect(reportClientError).not.toHaveBeenCalled();
	});

	it("reports anything that kept someone out through no fault of theirs", () => {
		const err = new TypeError("Failed to fetch");
		trackLoginFailure({ method: "password", stage: "credentials", reason: "network_error", error: err });
		expect(capture).toHaveBeenCalledWith("login_failed", expect.objectContaining({ expected: false }));
		expect(reportClientError).toHaveBeenCalledWith(err, {
			area: "login",
			method: "password",
			stage: "credentials",
			reason: "network_error",
		});
	});

	it("reports a failure with no error object under its reason", () => {
		trackLoginFailure({ stage: "clerk_load", reason: "clerk_not_loaded" });
		const [error] = reportClientError.mock.calls[0];
		expect((error as Error).message).toBe("Login failed: clerk_not_loaded");
	});
});
