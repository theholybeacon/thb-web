import { afterEach, describe, expect, it } from "vitest";
import { API_KEY_HEADER, authenticate } from "./auth";

function requestWithKey(key?: string): Request {
	const headers = new Headers();
	if (key !== undefined) headers.set(API_KEY_HEADER, key);
	return new Request("https://example.test/api/content/v1/meta", { headers });
}

const ORIGINAL = process.env.CONTENT_API_KEY;
afterEach(() => {
	if (ORIGINAL === undefined) delete process.env.CONTENT_API_KEY;
	else process.env.CONTENT_API_KEY = ORIGINAL;
});

describe("authenticate", () => {
	it("accepts the configured key", () => {
		process.env.CONTENT_API_KEY = "s3cret";
		expect(authenticate(requestWithKey("s3cret"))).toBe(true);
	});

	it("rejects a wrong or missing key", () => {
		process.env.CONTENT_API_KEY = "s3cret";
		expect(authenticate(requestWithKey("wrong"))).toBe(false);
		expect(authenticate(requestWithKey(""))).toBe(false);
		expect(authenticate(requestWithKey())).toBe(false);
	});

	it("rejects a key that is merely a prefix of the real one", () => {
		process.env.CONTENT_API_KEY = "s3cretlong";
		expect(authenticate(requestWithKey("s3cret"))).toBe(false);
	});

	it("FAILS CLOSED when no key is configured", () => {
		// The dangerous alternative would be publishing the whole catalogue the
		// first time someone forgot the env var in a new environment.
		delete process.env.CONTENT_API_KEY;
		expect(authenticate(requestWithKey("anything"))).toBe(false);

		process.env.CONTENT_API_KEY = "   ";
		expect(authenticate(requestWithKey("anything"))).toBe(false);
	});

	it("treats the secret as opaque, so colons carry no meaning", () => {
		// Guards the removal of the old "label:secret" parsing: the whole value
		// is the secret now, and nothing splits it.
		process.env.CONTENT_API_KEY = "aa:bb:cc";
		expect(authenticate(requestWithKey("aa:bb:cc"))).toBe(true);
		expect(authenticate(requestWithKey("aa"))).toBe(false);
		expect(authenticate(requestWithKey("bb:cc"))).toBe(false);
	});

	it("tolerates whitespace around the configured key and the presented one", () => {
		process.env.CONTENT_API_KEY = " s3cret ";
		expect(authenticate(requestWithKey("s3cret"))).toBe(true);
		expect(authenticate(requestWithKey(" s3cret "))).toBe(true);
	});
});
