import { describe, expect, it } from "vitest";
import { GlobalStudyCard } from "./Study";
import { ALL_LANGUAGES, CatalogFilter, catalogLanguages, defaultCatalogLanguage, filterCatalog, filterCatalogExceptKind } from "./catalogFilter";

function card(overrides: Partial<GlobalStudyCard>): GlobalStudyCard {
	return {
		id: overrides.slug ?? "id",
		slug: "story-test",
		kind: "story",
		language: "en",
		creatorName: null,
		name: "Test",
		description: "",
		stepKinds: {},
		stepCount: 1,
		chapterCount: 1,
		bookCount: 1,
		coverImage: null,
		testament: "OT",
		adopted: null,
		...overrides,
	};
}

const cards = [
	card({ slug: "chronological", kind: "plan", name: "Chronological", testament: null }),
	card({ slug: "story-noahs-ark", name: "Noah's Ark", description: "The flood." }),
	card({ slug: "story-noahs-ark-es", language: "es", name: "El arca de Noé", description: "El diluvio." }),
	card({ slug: "story-prodigal-son", name: "The Prodigal Son", testament: "NT", adopted: { studyId: "s", sessionId: "x" } }),
];

const everything: CatalogFilter = { kind: "all", language: ALL_LANGUAGES, testament: "all", query: "", inProgress: false };
const slugs = (list: GlobalStudyCard[]) => list.map((c) => c.slug);

describe("the catalog's language", () => {
	it("opens in the app language when there is something in it", () => {
		expect(defaultCatalogLanguage(cards, "es")).toBe("es");
		expect(defaultCatalogLanguage(cards, "en")).toBe("en");
	});

	it("shows every language rather than an empty catalog", () => {
		expect(defaultCatalogLanguage(cards, "pt")).toBe(ALL_LANGUAGES);
	});

	it("lists the languages it is written in", () => {
		expect(catalogLanguages(cards)).toEqual(["en", "es"]);
	});
});

describe("filterCatalog", () => {
	it("keeps one language", () => {
		expect(slugs(filterCatalog(cards, { ...everything, language: "es" }))).toEqual(["story-noahs-ark-es"]);
	});

	it("keeps one kind, and counts kinds without it", () => {
		expect(slugs(filterCatalog(cards, { ...everything, kind: "plan" }))).toEqual(["chronological"]);
		expect(filterCatalogExceptKind(cards, { ...everything, kind: "plan" })).toHaveLength(4);
	});

	it("narrows stories to a testament and leaves the plans", () => {
		expect(slugs(filterCatalog(cards, { ...everything, language: "en", testament: "NT" })))
			.toEqual(["chronological", "story-prodigal-son"]);
	});

	it("searches name and description, ignoring case and accents", () => {
		expect(slugs(filterCatalog(cards, { ...everything, query: "noe" }))).toEqual(["story-noahs-ark-es"]);
		expect(slugs(filterCatalog(cards, { ...everything, query: "FLOOD" }))).toEqual(["story-noahs-ark"]);
		expect(slugs(filterCatalog(cards, { ...everything, query: "arca diluvio" }))).toEqual(["story-noahs-ark-es"]);
	});

	it("keeps only what the reader has taken", () => {
		expect(slugs(filterCatalog(cards, { ...everything, inProgress: true }))).toEqual(["story-prodigal-son"]);
	});
});
