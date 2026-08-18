"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ContributionKind } from "@/app/common/community/model/Community";
import {
	COMMUNITY_FEED_SORTS,
	COMMUNITY_FEED_SOURCES,
	DEFAULT_FEED_SORT,
	type CommunityFeedQuery,
	type CommunityFeedSort,
	type CommunityFeedSource,
} from "@/app/common/community/model/CommunityFeed";

const KINDS: ContributionKind[] = ["comment", "fact", "analysis", "correction"];

function num(value: string | null): number | undefined {
	if (!value) return undefined;
	const n = Number(value);
	return Number.isInteger(n) && n > 0 ? n : undefined;
}

function oneOf<T extends string>(value: string | null, allowed: readonly T[]): T | undefined {
	return value && (allowed as readonly string[]).includes(value) ? (value as T) : undefined;
}

/**
 * The feed's filter/sort/page state, read from and written to the URL.
 *
 * URL rather than component state — unlike the notes page, which can hold state
 * locally only because it fetches every row once and filters in memory. This
 * feed is filtered server-side, so every value is already part of the
 * react-query key; putting it in the URL costs one router call and buys
 * shareable links for free. The deciding argument is the dominant interaction:
 * feed -> open in reader -> back. Browser back restores the URL and with it the
 * filters, where local state would drop the user on an unfiltered page 1.
 *
 * Everything is validated on the way in — these values reach SQL, and a
 * hand-edited ?sort=drop is not a sort.
 */
export function useFeedParams() {
	const sp = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();

	const query: CommunityFeedQuery = useMemo(
		() => ({
			bibleId: sp.get("bible") ?? undefined,
			bookAbbreviation: sp.get("book") ?? undefined,
			chapter: num(sp.get("ch")),
			verse: num(sp.get("v")),
			kind: oneOf<ContributionKind>(sp.get("kind"), KINDS),
			authorUserId: sp.get("author") ?? undefined,
			mineOnly: sp.get("mine") === "1",
			source: oneOf<CommunityFeedSource>(sp.get("src"), COMMUNITY_FEED_SOURCES) ?? "all",
			sort: oneOf<CommunityFeedSort>(sp.get("sort"), COMMUNITY_FEED_SORTS) ?? DEFAULT_FEED_SORT,
			page: num(sp.get("page")) ?? 1,
		}),
		[sp],
	);

	const setParams = useCallback(
		(patch: Partial<CommunityFeedQuery>) => {
			const next: CommunityFeedQuery = { ...query, ...patch };

			// Strictly downward-clearing cascade: a chapter number means nothing
			// without a book, and a verse means nothing without a chapter.
			if (patch.bibleId !== undefined || patch.bookAbbreviation !== undefined) {
				if (patch.chapter === undefined) next.chapter = undefined;
				if (patch.verse === undefined) next.verse = undefined;
			}
			if (!next.bookAbbreviation) next.chapter = undefined;
			if (!next.chapter) next.verse = undefined;

			// "Mine only" and an explicit author are the same dimension.
			if (patch.mineOnly) next.authorUserId = undefined;
			if (patch.authorUserId) next.mineOnly = false;

			// Any filter change resets to page 1. Page 4 of the old filter is almost
			// never a page of the new one, and an empty result with no visible cause
			// reads as a bug.
			if (patch.page === undefined) next.page = 1;

			const params = new URLSearchParams();
			if (next.bibleId) params.set("bible", next.bibleId);
			if (next.bookAbbreviation) params.set("book", next.bookAbbreviation);
			if (next.chapter) params.set("ch", String(next.chapter));
			if (next.verse) params.set("v", String(next.verse));
			if (next.kind) params.set("kind", next.kind);
			if (next.authorUserId) params.set("author", next.authorUserId);
			if (next.mineOnly) params.set("mine", "1");
			if (next.source && next.source !== "all") params.set("src", next.source);
			if (next.sort !== DEFAULT_FEED_SORT) params.set("sort", next.sort);
			if (next.page > 1) params.set("page", String(next.page));

			const qs = params.toString();
			const url = qs ? `${pathname}?${qs}` : pathname;

			// Paging pushes so Back means "the previous page of results"; filter
			// changes replace, so a session of narrowing does not bury the reader
			// behind twenty history entries.
			if (patch.page !== undefined) router.push(url, { scroll: false });
			else router.replace(url, { scroll: false });
		},
		[query, pathname, router],
	);

	const hasFilters =
		Boolean(query.bibleId) ||
		Boolean(query.bookAbbreviation) ||
		Boolean(query.kind) ||
		Boolean(query.authorUserId) ||
		Boolean(query.mineOnly) ||
		query.source !== "all";

	const clearFilters = useCallback(() => {
		// Sort survives a clear — it is a view preference, not a filter.
		const params = new URLSearchParams();
		if (query.sort !== DEFAULT_FEED_SORT) params.set("sort", query.sort);
		const qs = params.toString();
		router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
	}, [query.sort, pathname, router]);

	return { query, setParams, hasFilters, clearFilters };
}
