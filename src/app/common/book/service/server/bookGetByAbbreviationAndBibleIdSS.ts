"use server";
import { Book } from "../../model/Book";
import { BookRepository } from "../../repository/BookRepository";

/**
 * Fetches a Book by its URL slug and Bible ID.
 *
 * Primary lookup is by the `slug` field (URL-safe, ASCII-only).
 * Falls back to abbreviation matching for backward compatibility.
 *
 * @param bibleId - The Bible UUID
 * @param slugOrAbbreviation - The URL slug or abbreviation string to look up
 * @returns The matching Book or null if not found
 */
export async function bookGetByAbbreviationAndBibleIdSS(
    bibleId: string,
    slugOrAbbreviation: string
): Promise<Book | null> {
    const repository = new BookRepository();

    // Primary: Try slug lookup first
    const bySlug = await repository.getBySlugAndBibleId(bibleId, slugOrAbbreviation);
    if (bySlug) {
        return bySlug;
    }

    // Fallback: Try abbreviation lookup (backward compatibility)
    return await repository.getByAbbreviationAndBibleId(bibleId, slugOrAbbreviation);
}
