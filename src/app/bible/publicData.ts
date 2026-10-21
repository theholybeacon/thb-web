import { cache } from "react";
import { unstable_cache } from "next/cache";
import { bibleGetAllSS } from "@/app/common/bible/service/bibleGetAllSS";
import { bibleGetByVersionSS } from "@/app/common/bible/service/server/bibleGetByVersionSS";
import { bookGetAllByBibleIdSS } from "@/app/common/book/service/server/bookGetAllByBibleIdSS";
import { bookGetByAbbreviationAndBibleIdSS } from "@/app/common/book/service/server/bookGetByAbbreviationAndBibleIdSS";
import { BookRepository } from "@/app/common/book/repository/BookRepository";
import { ChapterVer } from "@/app/common/chapter/model/Chapter";
import { chapterGetStoredSS } from "@/app/common/chapter/service/chapterGetStoredSS";
import { loadFullChapter } from "@/app/common/chapter/service/chapterLoad";
import { entityMentionsGetForChapterSS } from "@/app/common/entity/service/server/entityMentionsGetForChapterSS";
import { entityGetBySlugSS } from "@/app/common/entity/service/server/entityGetBySlugSS";
import { entityGetReferencesSS } from "@/app/common/entity/service/server/entityGetReferencesSS";
import { entityContentGetSS } from "@/app/common/entity/service/server/entityContentGetSS";
import { entityListForIndexSS } from "@/app/common/entity/service/server/entityListForIndexSS";
import { EntityRepository } from "@/app/common/entity/repository/EntityRepository";
import { communityDataFor } from "@/app/common/community/service/communityThreads";
import { logger } from "@/app/utils/logger";
import { cacheWhen, isChapterComplete } from "./cacheWhen";

const log = logger.child({ module: "bible/publicData" });

/**
 * Cached reads behind the public Bible pages (/bible, the reader, the character
 * pages, their OpenGraph images, the sitemap and robots.txt).
 *
 * These pages render per request: the root layout reads the locale cookie and
 * the /bible layout the session. Without a cache every view — almost all of
 * them crawlers — ran a handful of queries, and a crawler arriving every few
 * minutes kept the production database awake around the clock, billed by the
 * hour. Through Next's data cache, which outlives requests and deployments,
 * an anonymous view of a page seen before touches no database at all.
 *
 * Scripture never changes once stored, so a complete chapter is cached for
 * good: each chapter costs the database once, not once per crawl. Everything
 * else (translations, books, characters) refreshes daily, so an edit shows up
 * within a day.
 *
 * Values come back through JSON: Date columns arrive as strings. Nothing on
 * these pages reads them.
 */

const DAY = 60 * 60 * 24;
const daily = { revalidate: DAY, tags: ["bible-public"] };
const forever = { revalidate: false as const, tags: ["bible-public", "scripture"] };

export const getBibles = unstable_cache(bibleGetAllSS, ["bible-all"], daily);

export const getBibleBySlug = cache(unstable_cache(bibleGetByVersionSS, ["bible-by-slug"], daily));

export const getBooks = cache(unstable_cache(bookGetAllByBibleIdSS, ["books-of-bible"], daily));

export const getBookBySlug = cache(
	unstable_cache(bookGetByAbbreviationAndBibleIdSS, ["book-by-slug"], daily),
);

export const getNextBook = unstable_cache(
	(bibleId: string, bookOrder: number) => new BookRepository().getNextByOrder(bibleId, bookOrder),
	["book-next"],
	daily,
);

const getFullChapter = cacheWhen(loadFullChapter, isChapterComplete, ["chapter-full"], forever);

export type ChapterWithBookName = ChapterVer & { bookName: string };

/**
 * A chapter with its verses, hydrating from api.bible on first read — see
 * `ChapterRepository.getFullChapter`. Null on an unexpected failure, as
 * `chapterGetByBookIdSS`.
 */
export const getChapter = cache(
	async (bookId: string, bookName: string, chapterNumber: number): Promise<ChapterWithBookName | null> => {
		try {
			return { ...(await getFullChapter(bookId, chapterNumber)), bookName };
		} catch (error) {
			log.error(`Error fetching chapter: ${error instanceof Error ? error.message : String(error)}`);
			return null;
		}
	},
);

/** Stored text only, never fetched upstream — for the OpenGraph image. */
export const getStoredChapter = cacheWhen(chapterGetStoredSS, isChapterComplete, ["chapter-stored"], forever);

export const getChapterMentions = unstable_cache(entityMentionsGetForChapterSS, ["chapter-mentions"], daily);

export const getEntityBySlug = cache(unstable_cache(entityGetBySlugSS, ["entity-by-slug"], daily));

export const getEntityReferences = unstable_cache(entityGetReferencesSS, ["entity-references"], daily);

/** Generated content, cached once it is ready: until then the page polls for it. */
export const getEntityContent = cacheWhen(
	entityContentGetSS,
	(content) => content?.generationStatus === "ready",
	["entity-content"],
	daily,
);

export const getEntityMentionCount = cache(
	unstable_cache(
		(entityId: string) => new EntityRepository().countMentions(entityId),
		["entity-mention-count"],
		daily,
	),
);

export const getEntityIndex = unstable_cache(entityListForIndexSS, ["entity-index"], daily);

export const getIndexedEntitySlugs = unstable_cache(
	(minMentions: number) => new EntityRepository().getSlugsWithMinMentions(minMentions),
	["entity-indexed-slugs"],
	daily,
);

/**
 * A character's community threads as an anonymous visitor sees them. Signed-in
 * visitors read them live (their votes, their own posts); everyone else may see
 * a new post up to ten minutes late.
 */
export const getAnonymousCommunity = unstable_cache(
	(entityId: string) => communityDataFor(entityId, null),
	["entity-community-anonymous"],
	{ revalidate: 60 * 10, tags: ["bible-public"] },
);
