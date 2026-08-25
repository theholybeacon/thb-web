import { AUDIO_VOICES, DEFAULT_VOICE } from "@/app/common/audio/model/AudioAsset";
import { NT_CHAPTERS, OT_CHAPTERS, TOTAL_BOOKS, TOTAL_CHAPTERS } from "@/app/common/canon/model/canon";
import { entityListForIndexSS } from "@/app/common/entity/service/server/entityListForIndexSS";
import { GLOBAL_STUDIES } from "@/app/common/study/model/globalStudyCatalog";
import { globalStudyChapterCount } from "@/app/common/study/model/globalStudy";
import { locales } from "@/i18n/request";
import { MAX_RANGE_VERSES, knownBookKeys } from "@/lib/contentApi/reference";
import { ok } from "@/lib/contentApi/respond";
import { listTranslations, toTranslationSummary } from "@/lib/contentApi/translations";
import { withContentApi } from "@/lib/contentApi/withContentApi";
import { CHARACTER_DATA_LICENSE } from "@/lib/contentApi/license";

/**
 * The catalogue: everything a consumer needs to construct a valid request to
 * any other endpoint, and the real counts behind the product's claims.
 *
 * Counts are read live rather than hardcoded — the marketing pipeline must be
 * able to say "N translations" without anyone editing a constant when N moves.
 */
export const dynamic = "force-dynamic";

export const GET = withContentApi(async () => {
	const [bibles, characterIndex] = await Promise.all([
		listTranslations(),
		// page 1 is the cheapest way to get the authoritative total.
		entityListForIndexSS({ page: 1 }),
	]);

	const translations = bibles.map(toTranslationSummary);

	return ok({
		api: {
			readOnly: true,
			maxVerseRange: MAX_RANGE_VERSES,
			acceptedBookKeys: knownBookKeys(),
		},
		counts: {
			translations: translations.length,
			translationsOpenLicensed: translations.filter((t) => t.license.openLicensed).length,
			translationsWarm: translations.filter((t) => t.warm).length,
			translationsWithAudioEnabled: translations.filter((t) => t.audioEnabled).length,
			characters: characterIndex.total,
			studyPlans: GLOBAL_STUDIES.length,
			books: TOTAL_BOOKS,
			chapters: TOTAL_CHAPTERS,
			chaptersOldTestament: OT_CHAPTERS,
			chaptersNewTestament: NT_CHAPTERS,
		},
		translations,
		voices: AUDIO_VOICES.map((id) => ({
			id,
			gender: id === "onyx" ? "male" : "female",
			isDefault: id === DEFAULT_VOICE,
		})),
		/** Interface languages the product ships. NOT the reading languages. */
		interfaceLocales: [...locales],
		studyPlans: GLOBAL_STUDIES.map((s) => ({
			slug: s.slug,
			name: s.name,
			readings: s.steps.length,
			chapters: globalStudyChapterCount(s),
			coversWholeCanon: s.coversWholeCanon,
		})),
		timestamps: {
			/**
			 * Stated up front so nothing downstream has to guess. Verse offsets are
			 * frame-counted from the narration MP3s, so they are exact. Nothing in
			 * this system holds word-level timings.
			 */
			verseLevel: true,
			wordLevel: false,
			note:
				"Verse-level start/end offsets ship with every ready narration and are exact " +
				"(frame-counted, not interpolated). Word-level timings do not exist anywhere in " +
				"this system. Note that the product's 'alignment' data is Strong's original-language " +
				"word mapping and carries no timing information.",
		},
		licensing: {
			characters: CHARACTER_DATA_LICENSE,
			scripture:
				"Only translations with license.openLicensed = true may be republished or narrated in " +
				"published material.",
		},
	});
});
