"use server";

import { requirePremiumUserSS } from "../../../subscription/service/server/requirePremiumUserSS";
import { BibleRepository } from "../../../bible/repository/BibleRepository";
import { BookRepository } from "../../../book/repository/BookRepository";
import { resolveCanonicalBook } from "../../../note/service/noteTargetResolver";
import { CommunityRepository } from "../../repository/CommunityRepository";
import { hydrateContributions } from "../communityThreads";
import { ScriptureCommunityData } from "../../model/Community";

const EMPTY: ScriptureCommunityData = { contributions: [], linkMap: {} };

/**
 * Every published community thread visible while reading one chapter, flat.
 *
 * Signature deliberately mirrors `noteGetForChapterSS` — the panel loads both
 * off the same canonical chapter coordinates.
 *
 * Scripture discussion is premium end to end (unlike the character pages, where
 * reading is public and only writing is gated), so an unauthorized caller gets
 * an empty result rather than an error: the reader itself is public and must
 * still render.
 */
export async function scriptureCommunityListSS(
	bibleId: string,
	bookAbbreviation: string,
	chapter: number,
): Promise<ScriptureCommunityData> {
	let userId: string;
	try {
		userId = (await requirePremiumUserSS()).id;
	} catch {
		return EMPTY;
	}

	const bible = await new BibleRepository().getBasicById(bibleId);
	if (!bible) return EMPTY;

	// Normalize through the same resolver the write path uses, so the key a
	// thread was stored under and the key it is looked up by cannot drift.
	const book = await resolveCanonicalBook(bibleId, bookAbbreviation);
	if (!book) return EMPTY;

	const repo = new CommunityRepository();
	const rows = await repo.listScriptureContributions(bibleId, book.apiId.toUpperCase(), chapter);
	const contributions = await hydrateContributions(repo, rows, userId);

	// Citations can point at any book, not just the one being read. The book list
	// is already loaded by resolveCanonicalBook's repository, so a complete map
	// costs one more cheap query.
	const books = await new BookRepository().getAllByBibleId(bibleId);
	const linkMap: ScriptureCommunityData["linkMap"] = {};
	for (const b of books) {
		linkMap[b.apiId.toUpperCase()] = { bibleSlug: bible.slug, bookSlug: b.slug };
	}

	return { contributions, linkMap };
}
