/**
 * Migration script to backfill slug values for existing bible and book records.
 *
 * Run with: npx tsx scripts/backfill-slugs.ts
 *
 * This script:
 * 1. Fetches all bibles and generates URL-safe slugs from their version field
 * 2. Fetches all books and generates URL-safe slugs from their abbreviation field
 * 3. Handles collisions by appending language code or numeric suffix
 * 4. Updates the database with the generated slugs
 */

import { db } from "../src/db";
import { bibleTable } from "../src/db/schema/bible";
import { bookTable } from "../src/db/schema/book";
import { toUrlSlug, makeUniqueSlug } from "../src/lib/slug";
import { eq } from "drizzle-orm";

async function backfillBibleSlugs() {
    console.log("Backfilling Bible slugs...");

    // Get all bibles
    const bibles = await db.select().from(bibleTable);
    console.log(`Found ${bibles.length} bibles`);

    // Track used slugs to handle collisions
    const usedSlugs = new Set<string>();

    // First pass: collect existing slugs
    for (const bible of bibles) {
        if (bible.slug) {
            usedSlugs.add(bible.slug);
        }
    }

    // Second pass: generate slugs for bibles without one
    let updated = 0;
    for (const bible of bibles) {
        if (!bible.slug || bible.slug === "") {
            const baseSlug = toUrlSlug(bible.version);
            const slug = makeUniqueSlug(baseSlug, usedSlugs, bible.language.toLowerCase().slice(0, 2));
            usedSlugs.add(slug);

            await db
                .update(bibleTable)
                .set({ slug })
                .where(eq(bibleTable.id, bible.id));

            console.log(`  ${bible.version} -> ${slug}`);
            updated++;
        }
    }

    console.log(`Updated ${updated} bibles\n`);
}

async function backfillBookSlugs() {
    console.log("Backfilling Book slugs...");

    // Get all books grouped by bible
    const books = await db.select().from(bookTable);
    console.log(`Found ${books.length} books`);

    // Group books by bibleId
    const booksByBible = new Map<string, typeof books>();
    for (const book of books) {
        const existing = booksByBible.get(book.bibleId) || [];
        existing.push(book);
        booksByBible.set(book.bibleId, existing);
    }

    let updated = 0;
    for (const [, bibleBooks] of booksByBible) {
        // Track used slugs per bible
        const usedSlugs = new Set<string>();

        // First pass: collect existing slugs
        for (const book of bibleBooks) {
            if (book.slug) {
                usedSlugs.add(book.slug);
            }
        }

        // Second pass: generate slugs for books without one
        for (const book of bibleBooks) {
            if (!book.slug || book.slug === "") {
                const baseSlug = toUrlSlug(book.abbreviation);
                const slug = makeUniqueSlug(baseSlug, usedSlugs);
                usedSlugs.add(slug);

                await db
                    .update(bookTable)
                    .set({ slug })
                    .where(eq(bookTable.id, book.id));

                updated++;
            }
        }
    }

    console.log(`Updated ${updated} books\n`);
}

async function main() {
    console.log("Starting slug backfill migration...\n");

    try {
        await backfillBibleSlugs();
        await backfillBookSlugs();
        console.log("Migration complete!");
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }

    process.exit(0);
}

main();
