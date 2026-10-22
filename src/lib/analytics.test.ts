import { beforeEach, describe, expect, it, vi } from "vitest";

const { capture, initPostHog } = vi.hoisted(() => ({ capture: vi.fn(), initPostHog: vi.fn() }));
vi.mock("posthog-js", () => ({ default: { capture } }));
vi.mock("@/lib/posthog-client", () => ({ initPostHog }));

import { track } from "./analytics";

beforeEach(() => {
	capture.mockReset();
	initPostHog.mockReset();
});

describe("track", () => {
	it("sends the event with its properties once PostHog is set up", () => {
		initPostHog.mockReturnValue(true);
		track("note_created", { source: "reader" });
		expect(capture).toHaveBeenCalledWith("note_created", { source: "reader" });
	});

	it("sends events without properties", () => {
		initPostHog.mockReturnValue(true);
		track("logged_out");
		expect(capture).toHaveBeenCalledWith("logged_out", undefined);
	});

	it("does nothing when PostHog isn't configured", () => {
		initPostHog.mockReturnValue(false);
		track("note_created", { source: "reader" });
		expect(capture).not.toHaveBeenCalled();
	});
});
