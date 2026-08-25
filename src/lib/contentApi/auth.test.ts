import { afterEach, describe, expect, it } from "vitest";
import { API_KEY_HEADER, authenticate, hasConfiguredKeys } from "./auth";

function requestWithKey(key?: string): Request {
	const headers = new Headers();
	if (key !== undefined) headers.set(API_KEY_HEADER, key);
	return new Request("https://example.test/api/content/v1/meta", { headers });
}

const ORIGINAL = process.env.CONTENT_API_KEYS;
afterEach(() => {
	if (ORIGINAL === undefined) delete process.env.CONTENT_API_KEYS;
	else process.env.CONTENT_API_KEYS = ORIGINAL;
});

describe("authenticate", () => {
	it("accepts a configured key and reports which consumer it is", () => {
		process.env.CONTENT_API_KEYS = "marketing:s3cret,localdev:other";
		expect(authenticate(requestWithKey("s3cret"))).toEqual({ label: "marketing" });
		expect(authenticate(requestWithKey("other"))).toEqual({ label: "localdev" });
	});

	it("rejects a wrong or missing key", () => {
		process.env.CONTENT_API_KEYS = "marketing:s3cret";
		expect(authenticate(requestWithKey("wrong"))).toBeNull();
		expect(authenticate(requestWithKey(""))).toBeNull();
		expect(authenticate(requestWithKey())).toBeNull();
	});

	it("rejects a key that is merely a prefix of a real one", () => {
		process.env.CONTENT_API_KEYS = "marketing:s3cretlong";
		expect(authenticate(requestWithKey("s3cret"))).toBeNull();
	});

	it("FAILS CLOSED when no keys are configured", () => {
		// The dangerous alternative would be publishing the whole catalogue the
		// first time someone forgot the env var in a new environment.
		delete process.env.CONTENT_API_KEYS;
		expect(hasConfiguredKeys()).toBe(false);
		expect(authenticate(requestWithKey("anything"))).toBeNull();

		process.env.CONTENT_API_KEYS = "   ";
		expect(authenticate(requestWithKey("anything"))).toBeNull();
	});

	it("keeps secrets that contain colons intact", () => {
		process.env.CONTENT_API_KEYS = "marketing:aa:bb:cc";
		expect(authenticate(requestWithKey("aa:bb:cc"))).toEqual({ label: "marketing" });
		expect(authenticate(requestWithKey("aa"))).toBeNull();
	});

	it("ignores malformed entries instead of trusting them", () => {
		process.env.CONTENT_API_KEYS = "noseparator,:emptylabel,trailing:,good:key";
		expect(authenticate(requestWithKey("noseparator"))).toBeNull();
		expect(authenticate(requestWithKey("emptylabel"))).toBeNull();
		expect(authenticate(requestWithKey(""))).toBeNull();
		expect(authenticate(requestWithKey("key"))).toEqual({ label: "good" });
	});

	it("tolerates whitespace around entries", () => {
		process.env.CONTENT_API_KEYS = " marketing:s3cret , localdev:other ";
		expect(authenticate(requestWithKey("s3cret"))).toEqual({ label: "marketing" });
	});
});
