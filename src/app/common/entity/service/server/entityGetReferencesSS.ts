"use server";

import { bibleGetAllSS } from "../../../bible/service/bibleGetAllSS";
import { BookRepository } from "../../../book/repository/BookRepository";
import { EntityRepository } from "../../repository/EntityRepository";

export type EntityReferenceGroup = {
	bookAbbreviation: string;
	bookName: string;
	bookSlug: string;
	bookOrder: number;
	/** Verses grouped by chapter for compact display, e.g. { 12: [1,4,7] }. */
	chapters: { chapter: number; verses: number[] }[];
};

export type EntityReferences = {
	/** Bible slug used to build reader deep-links (null if no translation available). */
	bibleSlug: string | null;
	totalMentions: number;
	groups: EntityReferenceGroup[];
};

/**
 * Resolves an entity's canonical mentions into a display-ready, translation-specific
 * reference list that deep-links back into the reader. Picks an English translation
 * by default (or the first available) when no bibleId is supplied.
 */
export async function entityGetReferencesSS(
	entityId: string,
	bibleId?: string,
): Promise<EntityReferences> {
	const bibles = await bibleGetAllSS();
	const bible =
		(bibleId && bibles.find((b) => b.id === bibleId)) ||
		bibles.find((b) => b.language?.toLowerCase() === "english") ||
		bibles[0];

	const mentions = await new EntityRepository().getMentionsByEntityId(entityId);

	if (!bible) {
		return { bibleSlug: null, totalMentions: mentions.length, groups: [] };
	}

	// Ensure books are loaded for this translation, then index by canonical id.
	const books = await new BookRepository().getAllByBibleId(bible.id);
	const bookByKey = new Map<string, (typeof books)[number]>();
	for (const b of books) {
		bookByKey.set(b.abbreviation.toLowerCase(), b);
		bookByKey.set(b.apiId.toLowerCase(), b);
		bookByKey.set(b.slug.toLowerCase(), b);
	}

	// Group mentions: bookAbbreviation -> chapter -> Set<verse>.
	const byBook = new Map<string, Map<number, Set<number>>>();
	for (const m of mentions) {
		const chapters = byBook.get(m.bookAbbreviation) ?? new Map<number, Set<number>>();
		const verses = chapters.get(m.chapter) ?? new Set<number>();
		verses.add(m.verse);
		chapters.set(m.chapter, verses);
		byBook.set(m.bookAbbreviation, chapters);
	}

	const groups: EntityReferenceGroup[] = [];
	for (const [bookAbbreviation, chapters] of byBook) {
		const book = bookByKey.get(bookAbbreviation.toLowerCase());
		if (!book) continue; // book not present in this translation — skip rather than break links
		groups.push({
			bookAbbreviation,
			bookName: book.name,
			bookSlug: book.slug,
			bookOrder: book.bookOrder,
			chapters: Array.from(chapters.entries())
				.map(([chapter, verses]) => ({
					chapter,
					verses: Array.from(verses).sort((a, b) => a - b),
				}))
				.sort((a, b) => a.chapter - b.chapter),
		});
	}

	groups.sort((a, b) => a.bookOrder - b.bookOrder);

	return { bibleSlug: bible.slug, totalMentions: mentions.length, groups };
}
