import { describe, expect, it } from "vitest";
import { defaultDefinitionLanguage, isDefinitionLanguage } from "./dictionaryLanguage";

describe("defaultDefinitionLanguage", () => {
	it("defines a Bible's words in its own language when we can", () => {
		expect(defaultDefinitionLanguage("es")).toBe("es");
		expect(defaultDefinitionLanguage("en")).toBe("en");
	});

	it("falls back to English for languages without a dictionary", () => {
		expect(defaultDefinitionLanguage("pt")).toBe("en");
		expect(defaultDefinitionLanguage(null)).toBe("en");
	});
});

describe("isDefinitionLanguage", () => {
	it("accepts only the supported codes", () => {
		expect(isDefinitionLanguage("es")).toBe(true);
		expect(isDefinitionLanguage("fr")).toBe(false);
		expect(isDefinitionLanguage(undefined)).toBe(false);
	});
});
