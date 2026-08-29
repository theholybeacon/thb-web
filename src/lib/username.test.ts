import { describe, expect, it } from "vitest";
import { normalizeUsername, validateUsername } from "./username";

describe("normalizeUsername", () => {
	it("produces the handle that will appear in the URL", () => {
		expect(normalizeUsername("José Álvarez")).toBe("jose-alvarez");
		expect(normalizeUsername("John_Doe")).toBe("john-doe");
		expect(normalizeUsername("  Mary   Jane  ")).toBe("mary-jane");
	});

	it("reads blank input as nothing chosen, not as a placeholder name", () => {
		// toUrlSlug answers "untitled" here, which would look like a suggestion.
		expect(normalizeUsername("")).toBe("");
		expect(normalizeUsername("   ")).toBe("");
		expect(normalizeUsername("!!!")).toBe("");
	});

	it("truncates without leaving a trailing hyphen", () => {
		const long = normalizeUsername("a".repeat(40));
		expect(long).toHaveLength(30);
		expect(normalizeUsername(`${"ab".repeat(14)} cd`)).not.toMatch(/-$/);
	});
});

describe("validateUsername", () => {
	it("accepts a normalized handle", () => {
		expect(validateUsername("jose-alvarez")).toBeNull();
		expect(validateUsername("mary1")).toBeNull();
	});

	it("rejects what Clerk or the URL would reject", () => {
		expect(validateUsername("jo")).toBe("tooShort");
		expect(validateUsername("a".repeat(31))).toBe("tooLong");
		expect(validateUsername("-mary")).toBe("invalid");
		expect(validateUsername("mary-")).toBe("invalid");
		expect(validateUsername("Mary")).toBe("invalid");
	});
});
