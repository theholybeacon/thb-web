import type { RefLinkMap } from "@/components/entity/CitationLinks";
import type { Author, Contribution, ContributionFull, ContributionKind } from "./Community";

/**
 * The global community feed — every published contribution, scripture- and
 * entity-anchored alike, filtered and sorted server-side.
 *
 * Deliberately free of any drizzle/db imports, like `noteScope`, so the filter
 * bar and the feed cards can import these types and constants directly.
 */

export const COMMUNITY_FEED_PAGE_SIZE = 20;

/** Root comment threads kept per feed item; the rest collapse behind a link. */
export const FEED_THREAD_PREVIEW_ROOTS = 3;

/**
 * `activity` and `comments` read the denormalized lastActivityAt/commentCount
 * columns rather than aggregating community_comment per request — see the
 * comment on CommunityPostgreSQLDao.listFeed.
 */
export const COMMUNITY_FEED_SORTS = ["activity", "newest", "oldest", "score", "comments"] as const;
export type CommunityFeedSort = (typeof COMMUNITY_FEED_SORTS)[number];
export const DEFAULT_FEED_SORT: CommunityFeedSort = "activity";

export const COMMUNITY_FEED_SOURCES = ["all", "scripture", "entity"] as const;
export type CommunityFeedSource = (typeof COMMUNITY_FEED_SOURCES)[number];

/**
 * Anchor filters match the row's own columns, so they narrow strictly downward
 * and never widen upward. `chapter: 6` matches the chapter thread and every
 * verse thread inside it, because verse-anchored rows carry their chapter too.
 * `verse: 16` matches only verse 16's threads — never the chapter thread above
 * them, and never a book- or bible-scope thread.
 *
 * That is the opposite of the reader panel, which deliberately widens (chapter +
 * its verses + the book and bible above) because it is assembling reading
 * context. The feed's filter is a narrowing tool and must not return things
 * nobody asked for.
 */
export type CommunityFeedFilters = {
	bibleId?: string;
	/** Uppercased USFM abbreviation (book.apiId). */
	bookAbbreviation?: string;
	chapter?: number;
	verse?: number;
	kind?: ContributionKind;
	authorUserId?: string;
	source?: CommunityFeedSource;
};

export type CommunityFeedQuery = CommunityFeedFilters & {
	sort: CommunityFeedSort;
	page: number;
	/** Resolved server-side from the session — the client never sends its own id. */
	mineOnly?: boolean;
};

/** The character a contribution augments. Null on scripture-anchored rows. */
export type FeedEntityRef = { slug: string; name: string };

/** What listFeed returns before hydration: a row plus its two joined relations. */
export type CommunityFeedRow = Contribution & { author: Author; entity: FeedEntityRef | null };

export type CommunityFeedItem = ContributionFull & {
	entity: FeedEntityRef | null;
	/**
	 * The thread's true reply count, off the denormalized column — `comments` is
	 * truncated to FEED_THREAD_PREVIEW_ROOTS roots before it leaves the server.
	 */
	totalComments: number;
};

export type CommunityFeedPage = {
	items: CommunityFeedItem[];
	total: number;
	page: number;
	pageSize: number;
	/**
	 * bibleId -> citation link map. Keyed by translation because the same book
	 * abbreviation resolves to a different bookSlug in every translation, so one
	 * flat RefLinkMap would silently link a KJV citation into an RVR60 URL.
	 * Only populated for pages that actually carry citations.
	 */
	linkMapByBible: Record<string, RefLinkMap>;
};

export type CommunityFeedFacets = {
	bibles: { bibleId: string; name: string; version: string | null; count: number }[];
	books: { bookAbbreviation: string; bookName: string; count: number }[];
	kinds: { kind: ContributionKind; count: number }[];
	/** Top contributors only — see the cap documented on listFeedFacets. */
	authors: { userId: string; name: string; username: string; count: number }[];
	sources: { scripture: number; entity: number };
};

export const EMPTY_FEED_FACETS: CommunityFeedFacets = {
	bibles: [],
	books: [],
	kinds: [],
	authors: [],
	sources: { scripture: 0, entity: 0 },
};
