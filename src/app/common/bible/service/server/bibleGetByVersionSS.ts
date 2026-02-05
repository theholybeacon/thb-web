'use server';

import { Bible } from "../../model/Bible";
import { BibleRepository } from "../../repository/BibleRepository";

/**
 * Fetches a Bible by its URL slug.
 *
 * Primary lookup is by the `slug` field (URL-safe, ASCII-only).
 * Falls back to case-insensitive version matching for backward compatibility.
 *
 * @param slugOrVersion - The URL slug or version string to look up
 * @returns The matching Bible or null if not found
 */
export async function bibleGetByVersionSS(slugOrVersion: string): Promise<Bible | null> {
    const repository = new BibleRepository();

    // Primary: Try slug lookup first (direct database query)
    const bySlug = await repository.getBySlug(slugOrVersion);
    if (bySlug) {
        return bySlug;
    }

    // Fallback: Case-insensitive version matching (backward compatibility)
    const allBibles = await repository.getAll();
    const bible = allBibles.find(b =>
        b.version.toLowerCase() === slugOrVersion.toLowerCase()
    );

    return bible || null;
}
