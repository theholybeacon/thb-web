import { BibleRepository } from "@/app/common/bible/repository/BibleRepository";
import { bookGetAllByBibleIdSS } from "@/app/common/book/service/server/bookGetAllByBibleIdSS";
import { bibleLabel } from "@/lib/bibleLabel";
import { ALL_BIBLES_SCOPE, JourneyScope } from "./Completion";
import { availableChapters } from "./stats";

/**
 * Everything a stats payload needs to know about the zoom level it is being
 * computed at.
 *
 * `names` is fetched here rather than by each caller because both the private and
 * the public stats already needed localized book names, and the book rows that
 * supply them are the same rows that answer "how much of the canon does this
 * translation actually carry" — one query, two answers.
 */
export type ResolvedScope = {
	scope: JourneyScope;
	/** USFM -> the book's name in this translation. Empty when unresolved. */
	names: Record<string, string>;
	/** Canonical chapters this translation carries, or null at the All Bibles level. */
	availableChapters: number | null;
};

/**
 * Resolve the requested zoom level.
 *
 * An unknown or unreadable slug silently falls back to All Bibles rather than
 * erroring: the slug arrives from a URL a user can edit or a stale localStorage
 * value, and neither is worth breaking the page over.
 *
 * `fallbackBibleId` (the user's default Bible) is used for book NAMES only when
 * no scope was requested — it localizes the All Bibles view without implying the
 * numbers were filtered to that translation.
 */
export async function resolveScope(
	bibleSlug: string | null | undefined,
	fallbackBibleId: string | null | undefined,
): Promise<ResolvedScope> {
	let scope: JourneyScope = ALL_BIBLES_SCOPE;
	let bibleIdForNames = fallbackBibleId ?? null;

	if (bibleSlug) {
		try {
			const bible = await new BibleRepository().getBySlug(bibleSlug);
			if (bible) {
				scope = { bibleId: bible.id, slug: bible.slug, label: bibleLabel(bible) };
				bibleIdForNames = bible.id;
			}
		} catch {
			// Fall through to All Bibles.
		}
	}

	if (!bibleIdForNames) return { scope, names: {}, availableChapters: null };

	try {
		const books = await bookGetAllByBibleIdSS(bibleIdForNames);
		// Keyed on apiId, not `abbreviation`: apiId holds the USFM code ("GEN") that
		// the canon and the reader both use, while `abbreviation` is the display
		// form ("Gen") and would never match.
		const names = Object.fromEntries(books.map((b) => [b.apiId, b.name]));
		return {
			scope,
			names,
			// Only meaningful when we are actually zoomed into that translation.
			availableChapters: scope.bibleId
				? availableChapters(Object.fromEntries(books.map((b) => [b.apiId, b.numChapters ?? 0])))
				: null,
		};
	} catch {
		return { scope, names: {}, availableChapters: null };
	}
}
