import { BiblePostgreSQLDao } from "@/app/common/bible/dao/BiblePostgreSQLDao";
import type { Bible } from "@/app/common/bible/model/Bible";
import { isIndexedTranslation } from "@/lib/seo";
import { isRecommended, recommendedBySlug } from "@/lib/recommendedBible";
import { TranslationLicense, translationLicense } from "./license";
import { notFound } from "./withContentApi";

/**
 * Translation lookup for the Content API.
 *
 * Goes straight to the Postgres DAO rather than through BibleRepository, whose
 * `getAll()` seeds the table from api.bible when it is empty. That is correct
 * for the app and wrong here: this namespace must not perform catalogue writes,
 * and an empty table is a deployment problem to surface, not to paper over.
 */

export type TranslationSummary = {
	slug: string;
	version: string;
	name: string;
	language: string;
	/** Cleared for narration. Mirrors bible.audioEnabled. */
	audioEnabled: boolean;
	/**
	 * True for the small curated set kept pre-loaded by `npm run warm:bible`.
	 * Verse lookups against these are reliably instant; others may be cold.
	 */
	warm: boolean;
	recommended: boolean;
	/** Why we point readers at this edition, when it is a recommended one. */
	recommendedReason: string | null;
	readerUrl: string;
	license: TranslationLicense;
};

const dao = new BiblePostgreSQLDao();

export function toTranslationSummary(bible: Bible): TranslationSummary {
	const recommendation = recommendedBySlug(bible.slug);
	return {
		slug: bible.slug,
		version: bible.version,
		name: bible.name,
		language: bible.language,
		audioEnabled: bible.audioEnabled,
		warm: isIndexedTranslation(bible.slug),
		recommended: isRecommended(bible.slug),
		recommendedReason: recommendation?.why ?? null,
		readerUrl: `/bible/${bible.slug}`,
		license: translationLicense(bible),
	};
}

export async function listTranslations(): Promise<Bible[]> {
	return await dao.getAll();
}

/**
 * Resolves the `translation` query parameter, defaulting to the recommended
 * English edition so a caller that omits it still gets an open-licensed,
 * narratable, warm translation rather than an arbitrary row.
 */
export async function resolveTranslation(slugOrVersion: string | null): Promise<Bible> {
	const wanted = slugOrVersion?.trim() || "bsb-en";

	const bySlug = await dao.getBySlug(wanted);
	if (bySlug) return bySlug;

	// Backward-compatible version match, same order of preference as
	// bibleGetByVersionSS. Case-insensitive; version is not unique, so prefer a
	// warm slug when several rows share a version code.
	const all = await dao.getAll();
	const matches = all.filter((b) => b.version.toLowerCase() === wanted.toLowerCase());
	const chosen = matches.find((b) => isIndexedTranslation(b.slug)) ?? matches[0];

	if (!chosen) {
		throw notFound("TRANSLATION_NOT_FOUND", {
			message: `No translation matches "${wanted}". See /api/content/v1/meta for the catalogue.`,
		});
	}
	return chosen;
}
