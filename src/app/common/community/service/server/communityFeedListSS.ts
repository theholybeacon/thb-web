"use server";

import { requirePremiumUserSS } from "../../../subscription/service/server/requirePremiumUserSS";
import { CommunityRepository } from "../../repository/CommunityRepository";
import { hydrateContributions } from "../communityThreads";
import {
	COMMUNITY_FEED_PAGE_SIZE,
	DEFAULT_FEED_SORT,
	FEED_THREAD_PREVIEW_ROOTS,
	type CommunityFeedItem,
	type CommunityFeedPage,
	type CommunityFeedQuery,
} from "../../model/CommunityFeed";

const EMPTY: CommunityFeedPage = {
	items: [],
	total: 0,
	page: 1,
	pageSize: COMMUNITY_FEED_PAGE_SIZE,
	linkMapByBible: {},
};

/** Guards against a hand-typed ?page=999999 forcing a pointless deep offset. */
const MAX_PAGE = 500;

/**
 * A page of the global community feed.
 *
 * Premium end to end, like scriptureCommunityListSS — most of what lands here
 * is scripture discussion, which is already premium to read, so a public feed
 * would give away the paid surface. Entity contributions stay publicly readable
 * on the character page itself, so nothing that was public becomes private.
 *
 * Degrades to an empty page rather than throwing: the route is behind
 * PremiumGate, so a caller reaching here without premium is a race or a direct
 * action call, and neither deserves an error boundary.
 */
export async function communityFeedListSS(input: CommunityFeedQuery): Promise<CommunityFeedPage> {
	let userId: string;
	try {
		userId = (await requirePremiumUserSS()).id;
	} catch {
		return EMPTY;
	}

	const page = Math.min(MAX_PAGE, Math.max(1, input.page || 1));
	const repo = new CommunityRepository();

	const { rows, total } = await repo.listFeed({
		bibleId: input.bibleId,
		bookAbbreviation: input.bookAbbreviation,
		chapter: input.chapter,
		verse: input.verse,
		kind: input.kind,
		// The client never sends a user id for "mine": it asks for its own posts
		// and the server decides whose those are. An explicit author filter is a
		// facet id, which is public information either way.
		authorUserId: input.mineOnly ? userId : input.authorUserId,
		source: input.source === "all" ? undefined : input.source,
		sort: input.sort ?? DEFAULT_FEED_SORT,
		limit: COMMUNITY_FEED_PAGE_SIZE,
		offset: (page - 1) * COMMUNITY_FEED_PAGE_SIZE,
	});

	const full = await hydrateContributions(repo, rows, userId);

	// Truncate each thread to a preview. One hot chapter thread can carry
	// hundreds of comments and a page loads twenty threads at once; the full tree
	// belongs in the reader, which is one click away from every card. The
	// denormalized commentCount makes the "view all N" number free.
	const items: CommunityFeedItem[] = full.map((c) => ({
		...c,
		totalComments: c.commentCount,
		comments: c.comments.slice(0, FEED_THREAD_PREVIEW_ROOTS),
	}));

	// Built lazily: AddContributionForm never sends citations, so today every
	// user-written contribution has an empty array and this query never runs.
	// Kept correct anyway for the day a citation UI ships.
	const bibleIds = [
		...new Set(
			items
				.filter((i) => i.citations.length > 0)
				.map((i) => i.bibleId)
				.filter((id): id is string => Boolean(id)),
		),
	];
	const linkMapByBible = bibleIds.length > 0 ? await repo.listCitationLinkMaps(bibleIds) : {};

	return { items, total, page, pageSize: COMMUNITY_FEED_PAGE_SIZE, linkMapByBible };
}
