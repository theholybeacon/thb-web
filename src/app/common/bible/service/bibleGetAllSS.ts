'use server';

import { Bible } from "../model/Bible";
import { BibleRepository } from "../repository/BibleRepository";

/**
 * Fetches all available Bible translations.
 * If no bibles are cached locally, fetches from the external API and caches them.
 */
export async function bibleGetAllSS(): Promise<Bible[]> {
    const repository = new BibleRepository();
    return await repository.getAll();
}
