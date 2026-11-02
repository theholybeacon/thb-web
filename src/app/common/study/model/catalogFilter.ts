import { GlobalStudyCard } from "./Study";
import { StudyKind } from "./StudyKind";

/**
 * What the reader narrowed the catalog to. Kept apart from the component so
 * the rules (which language by default, what a search matches) are tested
 * without rendering.
 */
export type CatalogFilter = {
	kind: "all" | StudyKind;
	/** ISO 639-1, or every language. */
	language: string;
	/** Stories only: a plan spans both testaments. */
	testament: "all" | "OT" | "NT";
	query: string;
	/** Only what the reader has already taken. */
	inProgress: boolean;
};

export const ALL_LANGUAGES = "all";

/** The languages the catalog is written in, in the order first seen. */
export function catalogLanguages(cards: GlobalStudyCard[]): string[] {
	return [...new Set(cards.map((card) => card.language))];
}

/**
 * The reader's app language when the catalog has anything in it, so a Spanish
 * reader opens on the Spanish stories; otherwise everything, rather than an
 * empty page.
 */
export function defaultCatalogLanguage(cards: GlobalStudyCard[], locale: string): string {
	return cards.some((card) => card.language === locale) ? locale : ALL_LANGUAGES;
}

/** Lower case without accents: "noe" finds "Noé", "genesis" finds "Génesis". */
function fold(text: string): string {
	return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

function matchesQuery(card: GlobalStudyCard, query: string): boolean {
	const words = fold(query).split(/\s+/).filter(Boolean);
	if (!words.length) return true;
	const haystack = fold(`${card.name} ${card.description}`);
	return words.every((word) => haystack.includes(word));
}

/** Every filter but the kind: what the kind tabs count. */
export function filterCatalogExceptKind(cards: GlobalStudyCard[], filter: CatalogFilter): GlobalStudyCard[] {
	return cards.filter((card) =>
		(filter.language === ALL_LANGUAGES || card.language === filter.language)
		&& (filter.testament === "all" || card.kind !== "story" || card.testament === filter.testament)
		&& (!filter.inProgress || card.adopted !== null)
		&& matchesQuery(card, filter.query));
}

export function filterCatalog(cards: GlobalStudyCard[], filter: CatalogFilter): GlobalStudyCard[] {
	return filterCatalogExceptKind(cards, filter).filter((card) => filter.kind === "all" || card.kind === filter.kind);
}
