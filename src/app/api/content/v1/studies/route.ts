import { canonBook } from "@/app/common/canon/model/canon";
import {
	globalStudyChapterCount,
	stepChapterSpan,
} from "@/app/common/study/model/globalStudy";
import { GLOBAL_STUDIES } from "@/app/common/study/model/globalStudyCatalog";
import { ok } from "@/lib/contentApi/respond";
import { withContentApi } from "@/lib/contentApi/withContentApi";

/**
 * The ready-made reading plans offered to everyone.
 *
 * Only the shared catalogue is exposed. Plans a reader generates for themselves
 * are private user content and are deliberately not reachable from this API at
 * all — there is no endpoint that can return them.
 *
 * These are authored in code and seeded, so this needs no database round-trip
 * and cannot drift from what the catalogue screen shows.
 */
export const dynamic = "force-dynamic";

export const GET = withContentApi(async () => {
	return ok({
		studyPlans: GLOBAL_STUDIES.map((plan) => ({
			slug: plan.slug,
			name: plan.name,
			description: plan.description,
			readings: plan.steps.length,
			chapters: globalStudyChapterCount(plan),
			coversWholeCanon: plan.coversWholeCanon,
			catalogUrl: "/study",
			readings_preview: plan.steps.slice(0, 5).map((step) => {
				const span = stepChapterSpan(step);
				return {
					title: step.title,
					book: step.book,
					bookName: canonBook(step.book)?.englishName ?? step.book,
					startChapter: span?.start ?? null,
					endChapter: span?.end ?? null,
				};
			}),
		})),
		note:
			"Readers can also describe a topic and have a plan generated for them; those plans " +
			"belong to the reader and are not exposed here.",
	});
});
