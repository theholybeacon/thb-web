"use server";

import { requirePremiumUserSS } from "../../../subscription/service/server/requirePremiumUserSS";
import { CommunityRepository } from "../../repository/CommunityRepository";
import { EMPTY_FEED_FACETS, type CommunityFeedFacets } from "../../model/CommunityFeed";

/**
 * The options the feed's filter bar may offer, with counts.
 *
 * Deliberately a separate action rather than part of the feed response: facets
 * are filter-independent and change on the order of days, while the feed
 * changes on every filter click and page turn. Split query keys let the client
 * cache these once with a long staleTime, and the filter bar is populated and
 * interactive before the first page of results lands.
 */
export async function communityFeedFacetsSS(): Promise<CommunityFeedFacets> {
	try {
		await requirePremiumUserSS();
	} catch {
		return EMPTY_FEED_FACETS;
	}
	return new CommunityRepository().listFeedFacets();
}
