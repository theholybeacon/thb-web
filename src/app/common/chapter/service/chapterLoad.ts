import { cache } from "react";
import { ChapterVer } from "../model/Chapter";
import { ChapterRepository } from "../repository/ChapterRepository";

/**
 * Request-scoped chapter load.
 *
 * The chapter page resolves the same chapter twice per render — once in
 * `generateMetadata` for the title and description, once in the page body —
 * and each call used to hydrate independently. React's `cache` collapses them
 * into one for the lifetime of a request.
 *
 * This lives in a plain module rather than one of the `'use server'` services
 * because a server-action file may only export async functions, and `cache()`
 * returns a plain value.
 */
export const loadFullChapter = cache(
	async (bookId: string, chapterNumber: number): Promise<ChapterVer> => {
		const chapterRepository = new ChapterRepository();
		return await chapterRepository.getFullChapter(bookId, chapterNumber);
	},
);
