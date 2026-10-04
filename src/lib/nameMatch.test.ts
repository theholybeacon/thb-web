import { describe, expect, it } from "vitest";
import { buildNamePattern, containsName } from "./nameMatch";

describe("containsName", () => {
	it("matches accented names as whole words", () => {
		expect(containsName("Et l'Éternel parla à Moïse, disant:", "Moïse")).toBe(true);
		expect(containsName("Oracle d'Ésaïe, fils d'Amots", "Ésaïe")).toBe(true);
		expect(containsName("Y dijo Jesús: Padre", "jesús")).toBe(true);
	});

	it("does not match inside a longer word", () => {
		// `\b` would accept "Mose" inside "Moses", and treat "é" as a boundary.
		expect(containsName("Moses sprach", "Mose")).toBe(false);
		expect(containsName("Abrahamé", "Abraham")).toBe(false);
	});

	it("matches composed text against decomposed terms", () => {
		expect(containsName("Moïse".normalize("NFC"), "Moïse".normalize("NFD"))).toBe(true);
	});
});

describe("buildNamePattern", () => {
	it("prefers the longest term", () => {
		const m = buildNamePattern(["Jean", "Jean-Baptiste"])!.exec("vint Jean-Baptiste, prêchant");
		expect(m?.[0]).toBe("Jean-Baptiste");
	});
});
