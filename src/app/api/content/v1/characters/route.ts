import { ENTITY_INDEX_PAGE_SIZE } from "@/app/common/entity/model/Entity";
import { entityListForIndexSS } from "@/app/common/entity/service/server/entityListForIndexSS";
import { CHARACTER_DATA_LICENSE } from "@/lib/contentApi/license";
import { ok } from "@/lib/contentApi/respond";
import { withContentApi } from "@/lib/contentApi/withContentApi";

/**
 * Browse or search the character library.
 *
 * Wraps the same service that renders /bible/people, so paging, letter grouping
 * and the authoritative total all match what a reader sees — there is no second
 * query here to drift out of step with the page.
 */
export const dynamic = "force-dynamic";

export const GET = withContentApi(async (request) => {
	const search = request.nextUrl.searchParams;
	const rawPage = Number(search.get("page"));

	const index = await entityListForIndexSS({
		query: search.get("q")?.trim() || undefined,
		letter: search.get("letter")?.trim() || undefined,
		page: Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1,
	});

	return ok({
		characters: index.rows.map((row) => ({
			slug: row.slug,
			name: row.name,
			gender: row.gender,
			/** How many verses name this person — the best available prominence signal. */
			mentionCount: row.mentionCount,
			profileUrl: `/bible/people/${row.slug}`,
			apiUrl: `/api/content/v1/characters/${row.slug}`,
		})),
		page: {
			number: index.page,
			size: index.pageSize ?? ENTITY_INDEX_PAGE_SIZE,
			total: index.total,
			pages: Math.max(1, Math.ceil(index.total / (index.pageSize ?? ENTITY_INDEX_PAGE_SIZE))),
		},
		/** Initial letters that actually have entries, for building an A-Z index. */
		letters: index.letters,
		license: CHARACTER_DATA_LICENSE,
	});
});
