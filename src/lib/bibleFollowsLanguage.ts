import { languageNameToIso } from "@/lib/bibleLanguage";
import { RECOMMENDED_BIBLES, recommendedForLanguageCode, FALLBACK_RECOMMENDED_SLUG } from "@/lib/recommendedBible";

/**
 * Whether the Bible follows the app language.
 *
 * By default it does: a reader who switches the app to Español is moved to the
 * Spanish Bible at the same chapter, and a reader whose app is in English is
 * never left in a Spanish translation without being told. Readers testing found
 * the two languages being independent confusing — they changed the globe
 * expecting the text to change, or picked a translation in a language they did
 * not mean to.
 *
 * Readers who want the app in one language and the Bible in another turn this
 * off (the globe menu, or "Keep this translation" in the reader). It is a cookie,
 * like the app language itself, so it works signed out and is readable on the
 * server for the first paint.
 */
export const BIBLE_FOLLOWS_LANGUAGE_COOKIE = "bibleFollowsLanguage";

/** Absent means "follows": only an explicit opt-out decouples. */
export function bibleFollowsLanguage(cookieValue?: string | null): boolean {
	return cookieValue !== "off";
}

/** True when a translation is not in the app's language (unknown languages count as different). */
export function bibleLanguageDiffers(bibleLanguageName: string | null | undefined, locale: string): boolean {
	return languageNameToIso(bibleLanguageName) !== locale.split("-")[0].toLowerCase();
}

export interface BiblePath {
	bibleSlug: string;
	bookSlug?: string;
	chapter?: string;
}

/** `/bible/<bible>[/<book>[/<chapter>]]`, or null for any other page (including /bible/people). */
export function parseBiblePath(pathname: string | null | undefined): BiblePath | null {
	if (!pathname) return null;
	const [first, bibleSlug, bookSlug, chapter] = pathname.split("?")[0].split("/").filter(Boolean);
	if (first !== "bible" || !bibleSlug || bibleSlug === "people") return null;
	return { bibleSlug, bookSlug, chapter };
}

/** The reader URL for the same place in another translation; drops what the target lacks. */
export function biblePathFor(target: BiblePath): string {
	let path = `/bible/${target.bibleSlug}`;
	if (target.bookSlug) {
		path += `/${target.bookSlug}`;
		if (target.chapter) path += `/${target.chapter}`;
	}
	return path;
}

interface PickableBible {
	id: string;
	slug: string;
	language: string;
}

/**
 * The translation a picker starts on.
 *
 * A stored choice wins — it is a real decision, the language default only our
 * guess — unless the Bible follows the app language and that choice is in
 * another language: then the reader switched the app since, and expects the
 * Bible to have followed.
 */
export function pickDefaultBible<B extends PickableBible>(
	bibles: B[],
	opts: { storedId?: string | null; locale: string; followsLanguage: boolean },
): B | undefined {
	const stored = opts.storedId ? bibles.find((b) => b.id === opts.storedId) : undefined;
	if (stored && !(opts.followsLanguage && bibleLanguageDiffers(stored.language, opts.locale))) return stored;

	const forLocale = recommendedForLanguageCode(opts.locale);
	const bySlug = (slug?: string) => (slug ? bibles.find((b) => b.slug === slug) : undefined);
	return (
		bySlug(forLocale?.slug) ??
		// The list can be limited to one language (a study's): its recommendation, not an arbitrary row.
		RECOMMENDED_BIBLES.map((r) => bySlug(r.slug)).find(Boolean) ??
		bySlug(FALLBACK_RECOMMENDED_SLUG) ??
		bibles[0]
	);
}
