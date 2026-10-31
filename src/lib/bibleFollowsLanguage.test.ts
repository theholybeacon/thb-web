import { describe, expect, it } from "vitest";
import {
	bibleFollowsLanguage,
	bibleLanguageDiffers,
	biblePathFor,
	parseBiblePath,
	pickDefaultBible,
} from "./bibleFollowsLanguage";

describe("bibleFollowsLanguage", () => {
	it("follows unless the reader opted out", () => {
		expect(bibleFollowsLanguage(undefined)).toBe(true);
		expect(bibleFollowsLanguage("on")).toBe(true);
		expect(bibleFollowsLanguage("off")).toBe(false);
	});
});

describe("bibleLanguageDiffers", () => {
	it("compares api.bible language names with the locale", () => {
		expect(bibleLanguageDiffers("English", "en")).toBe(false);
		expect(bibleLanguageDiffers("Spanish", "en")).toBe(true);
		expect(bibleLanguageDiffers("Spanish; Castilian", "es")).toBe(false);
		expect(bibleLanguageDiffers("Klingon", "en")).toBe(true);
	});
});

describe("parseBiblePath / biblePathFor", () => {
	it("reads reader URLs", () => {
		expect(parseBiblePath("/bible/bsb-en/gen/1")).toEqual({ bibleSlug: "bsb-en", bookSlug: "gen", chapter: "1" });
		expect(parseBiblePath("/bible/bsb-en")).toEqual({ bibleSlug: "bsb-en", bookSlug: undefined, chapter: undefined });
	});

	it("ignores everything that is not a translation", () => {
		expect(parseBiblePath("/bible")).toBeNull();
		expect(parseBiblePath("/bible/people/moses")).toBeNull();
		expect(parseBiblePath("/home")).toBeNull();
		expect(parseBiblePath(null)).toBeNull();
	});

	it("builds the same place in another translation", () => {
		expect(biblePathFor({ bibleSlug: "vbl-sp-2", bookSlug: "genesis", chapter: "1" })).toBe("/bible/vbl-sp-2/genesis/1");
		expect(biblePathFor({ bibleSlug: "vbl-sp-2" })).toBe("/bible/vbl-sp-2");
	});
});

describe("pickDefaultBible", () => {
	const bibles = [
		{ id: "kjv", slug: "kjv-en", language: "English" },
		{ id: "bsb", slug: "bsb-en", language: "English" },
		{ id: "rvr", slug: "rvr09-sp", language: "Spanish" },
		{ id: "vbl", slug: "vbl-sp-2", language: "Spanish" },
	];

	it("uses the app language's translation when nothing is stored", () => {
		expect(pickDefaultBible(bibles, { locale: "es", followsLanguage: true })?.id).toBe("vbl");
		expect(pickDefaultBible(bibles, { locale: "en", followsLanguage: true })?.id).toBe("bsb");
	});

	it("keeps a stored choice in the app's language", () => {
		expect(pickDefaultBible(bibles, { storedId: "kjv", locale: "en", followsLanguage: true })?.id).toBe("kjv");
	});

	it("drops a stored choice in another language while the Bible follows the app", () => {
		expect(pickDefaultBible(bibles, { storedId: "kjv", locale: "es", followsLanguage: true })?.id).toBe("vbl");
	});

	it("keeps a stored choice in any language once decoupled", () => {
		expect(pickDefaultBible(bibles, { storedId: "rvr", locale: "en", followsLanguage: false })?.id).toBe("rvr");
	});

	it("falls back to a recommended row when the list is another language", () => {
		const spanishOnly = bibles.filter((b) => b.language === "Spanish");
		expect(pickDefaultBible(spanishOnly, { locale: "en", followsLanguage: true })?.id).toBe("vbl");
	});
});
