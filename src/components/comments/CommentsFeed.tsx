"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommunityContext } from "@/components/community/CommunityContext";
import { communityFeedListSS } from "@/app/common/community/service/server/communityFeedListSS";
import { communityFeedFacetsSS } from "@/app/common/community/service/server/communityFeedFacetsSS";
import { COMMUNITY_FEED_PAGE_SIZE } from "@/app/common/community/model/CommunityFeed";
import { CommentsFilters } from "./CommentsFilters";
import { FeedItemCard } from "./FeedItemCard";
import { useFeedParams } from "./useFeedParams";

export function CommentsFeed() {
	const t = useTranslations("comments");
	const tCommon = useTranslations("common");
	const queryClient = useQueryClient();
	const { query, setParams, hasFilters, clearFilters } = useFeedParams();

	const { data: facets } = useQuery({
		queryKey: ["community", "facets"],
		queryFn: () => communityFeedFacetsSS(),
		staleTime: 5 * 60_000,
	});

	const { data, isLoading, isError } = useQuery({
		queryKey: ["community", "feed", query],
		queryFn: () => communityFeedListSS(query),
		// Filter and page changes swap the list in place rather than blanking the
		// page and bouncing the scroll position to the top of an empty container.
		placeholderData: keepPreviousData,
	});

	/**
	 * Invalidate, not refetch: invalidateQueries marks every cached page stale and
	 * refetches only the mounted one, so paging back is still instant instead of
	 * serving a stale page. The shared "community" prefix catches the facet counts
	 * too, which a new reply also changes.
	 *
	 * Note what does NOT call this: VoteButtons holds its score in local state and
	 * never fires onChanged, which is what stops a card from jumping out from
	 * under the cursor while sorting by "most voted".
	 */
	const onChanged = () => queryClient.invalidateQueries({ queryKey: ["community"] });

	const bibleNameById = useMemo(() => {
		const map: Record<string, string> = {};
		for (const b of facets?.bibles ?? []) map[b.bibleId] = b.version || b.name;
		return map;
	}, [facets]);

	const total = data?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / COMMUNITY_FEED_PAGE_SIZE));
	const from = total === 0 ? 0 : (query.page - 1) * COMMUNITY_FEED_PAGE_SIZE + 1;
	const to = Math.min(total, query.page * COMMUNITY_FEED_PAGE_SIZE);
	const items = data?.items ?? [];

	return (
		// PremiumGate above this guarantees premium, so requirePremium is
		// unconditional — the same reasoning CommunitySection uses in the reader.
		<CommunityContext.Provider value={{ isPremium: true, requirePremium: () => true, onChanged }}>
			<div className="p-6 lg:p-8">
				<div className="mx-auto max-w-3xl">
					<div className="mb-6">
						<h1 className="flex items-center gap-2 text-3xl font-bold">
							<MessagesSquare className="h-7 w-7 text-primary" />
							{t("title")}
						</h1>
						<p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
					</div>

					<CommentsFilters
						query={query}
						facets={facets}
						onChange={setParams}
						hasFilters={hasFilters}
						onClear={clearFilters}
					/>

					{isLoading && (
						<div className="py-12 text-center">
							<div className="animate-pulse">{tCommon("loading")}</div>
						</div>
					)}

					{isError && <div className="py-12 text-center text-destructive">{tCommon("error")}</div>}

					{!isLoading && !isError && items.length === 0 && (
						<div className="py-16 text-center">
							<MessagesSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
							<p className="text-muted-foreground">{hasFilters ? t("empty") : t("emptyAll")}</p>
							{!hasFilters && <p className="mt-2 text-sm text-muted-foreground">{t("emptyHint")}</p>}
						</div>
					)}

					<div className="space-y-3">
						{items.map((item) => (
							<FeedItemCard
								key={item.id}
								item={item}
								// Each row resolves its citations against its own translation:
								// the same abbreviation maps to a different bookSlug in each.
								linkMap={(item.bibleId && data?.linkMapByBible[item.bibleId]) || {}}
								bibleName={item.bibleId ? bibleNameById[item.bibleId] : undefined}
							/>
						))}
					</div>

					{total > 0 && (
						<div className="mt-6 flex items-center justify-between gap-4 text-sm text-muted-foreground">
							<span>{t("resultCount", { from, to, total })}</span>
							<div className="flex items-center gap-2">
								<Button
									variant="ghost"
									size="sm"
									disabled={query.page <= 1}
									onClick={() => setParams({ page: query.page - 1 })}
								>
									<ChevronLeft className="h-4 w-4" />
									{t("previous")}
								</Button>
								<span>{t("pageOf", { page: query.page, total: totalPages })}</span>
								<Button
									variant="ghost"
									size="sm"
									disabled={query.page >= totalPages}
									onClick={() => setParams({ page: query.page + 1 })}
								>
									{t("next")}
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
						</div>
					)}
				</div>
			</div>
		</CommunityContext.Provider>
	);
}
