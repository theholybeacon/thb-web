'use server';

import { ChapterVer } from "../model/Chapter";
import { ChapterRepository } from "../repository/ChapterRepository";

/**
 * A chapter's stored text, or undefined. NEVER fetches from api.bible.
 *
 * For callers that must not spend upstream quota — above all the OpenGraph
 * image, which is rendered in its own request (so React's `cache` cannot
 * dedupe it against the page) and is requested by crawlers. Hydrating a cold
 * chapter there would burn the daily limit on images nobody is reading.
 */
export async function chapterGetStoredSS(
	bookId: string,
	chapterNumber: number,
): Promise<ChapterVer | undefined> {
	const chapterRepository = new ChapterRepository();
	return await chapterRepository.getByBookIdAndChapterNumber(bookId, chapterNumber);
}
