import type { ContentRef } from "@/app/common/entity/model/EntityContent";
import { entityContentGetSS } from "@/app/common/entity/service/server/entityContentGetSS";
import { entityGetBySlugSS } from "@/app/common/entity/service/server/entityGetBySlugSS";
import { entityGetReferencesSS } from "@/app/common/entity/service/server/entityGetReferencesSS";
import { CHARACTER_DATA_LICENSE } from "@/lib/contentApi/license";
import { ok } from "@/lib/contentApi/respond";
import { notFound, withContentApiParams } from "@/lib/contentApi/withContentApi";

/**
 * One character's full profile: the dataset facts, the generated narrative, and
 * every scripture citation behind it.
 *
 * Narrative sections are generated once per character and cached forever. Their
 * citations are filtered against the character's REAL verse mentions before
 * being stored, so a reference here always points at a verse that genuinely
 * names this person — `citationsValid` reports whether that filter had to drop
 * anything, and is passed through rather than hidden.
 */
export const dynamic = "force-dynamic";

/** "GEN 12:1" — the canonical form used everywhere else in the product. */
function formatRef(ref: ContentRef): string {
	return `${ref.bookAbbreviation} ${ref.chapter}:${ref.verse}`;
}

export const GET = withContentApiParams<{ slug: string }>(async (_request, { params }) => {
	const entity = await entityGetBySlugSS(params.slug);
	if (!entity) {
		throw notFound("CHARACTER_NOT_FOUND", {
			message: `No character with slug "${params.slug}". Search /api/content/v1/characters?q=`,
		});
	}

	const [content, references] = await Promise.all([
		entityContentGetSS(entity.id),
		entityGetReferencesSS(entity.id),
	]);

	const ready = content?.generationStatus === "ready";

	return ok({
		character: {
			slug: entity.slug,
			name: entity.name,
			aliases: entity.aliases,
			gender: entity.gender,
			/** Approximate dataset years. Negative means BC. Often null. */
			birthYear: entity.birthYear,
			deathYear: entity.deathYear,
			profileUrl: `/bible/people/${entity.slug}`,
		},
		/**
		 * Narrative is generated on first view. Absent here means "nobody has
		 * opened this character's page yet", not "this person has no story".
		 */
		profile: ready
			? {
					status: "ready" as const,
					overview: content!.overview,
					overviewRefs: content!.overviewRefs.map(formatRef),
					significance: content!.significance,
					significanceRefs: content!.significanceRefs.map(formatRef),
					timeline: content!.timeline.map((event) => ({
						title: event.title,
						description: event.description,
						refs: event.refs.map(formatRef),
					})),
					relationships: content!.relationships.map((rel) => ({
						name: rel.name,
						relation: rel.relation,
						relatedSlug: rel.entitySlug ?? null,
						refs: rel.refs.map(formatRef),
					})),
					/** False when a generated citation failed verification against real mentions. */
					citationsValid: content!.citationsValid,
					generatedAt: content!.generatedAt,
				}
			: {
					status: (content?.generationStatus ?? "not_generated") as string,
					message:
						"No narrative profile has been generated for this character yet. " +
						`Open /bible/people/${entity.slug} once to generate it, then re-request.`,
				},
		/** Every verse naming this person, grouped by book and chapter. */
		scripture: {
			totalMentions: references.totalMentions,
			linkedTranslation: references.bibleSlug,
			books: references.groups.map((group) => ({
				usfm: group.bookAbbreviation,
				name: group.bookName,
				chapters: group.chapters,
				citations: group.chapters.flatMap((c) =>
					c.verses.map((v) => `${group.bookAbbreviation} ${c.chapter}:${v}`),
				),
			})),
		},
		license: CHARACTER_DATA_LICENSE,
	});
});
