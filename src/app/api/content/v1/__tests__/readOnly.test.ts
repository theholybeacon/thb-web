import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Guards the API's central promise: nothing under /api/content can mutate.
 *
 * This is a structural check rather than a behavioural one on purpose. A test
 * that merely POSTed to today's routes would pass forever while someone adds a
 * mutating handler to a route it never heard of. Scanning the directory catches
 * the file that does not exist yet.
 */

const ROOT = path.resolve(__dirname, "..");
const MUTATING = ["POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

function routeFiles(dir: string): string[] {
	return readdirSync(dir).flatMap((entry) => {
		const full = path.join(dir, entry);
		if (statSync(full).isDirectory()) {
			return entry === "__tests__" ? [] : routeFiles(full);
		}
		return entry === "route.ts" || entry === "route.tsx" ? [full] : [];
	});
}

describe("the content API is read-only by construction", () => {
	const files = routeFiles(ROOT);

	it("has routes to check", () => {
		expect(files.length).toBeGreaterThan(0);
	});

	it.each(files)("%s exports no mutating handler", (file) => {
		const source = readFileSync(file, "utf8");
		for (const method of MUTATING) {
			expect(
				new RegExp(`export\\s+(const|async\\s+function|function)\\s+${method}\\b`).test(source),
				`${path.relative(ROOT, file)} exports a ${method} handler`,
			).toBe(false);
		}
	});

	it.each(files)("%s exports a GET handler", (file) => {
		const source = readFileSync(file, "utf8");
		expect(/export\s+const\s+GET\b/.test(source)).toBe(true);
	});

	it.each(files)("%s routes every request through withContentApi", (file) => {
		// The wrapper is what applies auth, throttling and error mapping. A route
		// that skips it would be an unauthenticated hole in the namespace.
		const source = readFileSync(file, "utf8");
		expect(source).toContain("withContentApi");
	});
});
