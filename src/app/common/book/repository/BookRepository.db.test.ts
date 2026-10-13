import { config } from "dotenv";
import { randomUUID } from "crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

config({ path: ".env.local" });

/**
 * A translation's book list is seeded on its first read. Concurrent first reads
 * used to each insert the whole list, leaving every book twice and splitting
 * the chapters' cached text across the copies.
 *
 * Writes only to a bible row it creates for itself (unique slug) and that
 * bible's books, and removes both afterwards. The upstream book list is
 * stubbed, so nothing calls api.bible. Runs only when DATABASE_URL is set.
 */

const hasDb = Boolean(process.env.DATABASE_URL);
const describeDb = hasDb ? describe : describe.skip;

const UPSTREAM = [
	{ apiId: "GEN", name: "Genesis", abbreviation: "GEN" },
	{ apiId: "EXO", name: "Exodus", abbreviation: "EXO" },
	{ apiId: "LEV", name: "Leviticus", abbreviation: "LEV" },
];

let bibleId: string | null = null;
let db: typeof import("@/db").db;
let bibleTable: typeof import("@/db/schema/bible").bibleTable;
let bookTable: typeof import("@/db/schema/book").bookTable;
let eq: typeof import("drizzle-orm").eq;

describeDb("seeding a translation's books", () => {
	beforeAll(async () => {
		({ db } = await import("@/db"));
		({ bibleTable } = await import("@/db/schema/bible"));
		({ bookTable } = await import("@/db/schema/book"));
		({ eq } = await import("drizzle-orm"));

		const tag = randomUUID().slice(0, 8);
		const [bible] = await db.insert(bibleTable).values({
			apiId: `test-${tag}`,
			name: `Book seeding test ${tag}`,
			language: "eng",
			version: "TEST",
			slug: `test-book-seeding-${tag}`,
		}).returning();
		bibleId = bible.id;

		// Like the real upstream DAO: fresh ids on every call, and slow enough
		// that concurrent first reads all find the book list empty.
		const { BookExternalAPIDao } = await import("../dao/BookExternalAPIDao");
		vi.spyOn(BookExternalAPIDao.prototype, "getAllByBibleId").mockImplementation(async () => {
			await new Promise((resolve) => setTimeout(resolve, 200));
			return UPSTREAM.map((b, i) => ({
				...b,
				id: randomUUID(),
				bibleId: "",
				bookOrder: i + 1,
				slug: b.abbreviation.toLowerCase(),
				numChapters: 1,
				createdAt: new Date(),
				updatedAt: new Date(),
			}));
		});
	});

	afterAll(async () => {
		vi.restoreAllMocks();
		if (!bibleId) return;
		await db.delete(bookTable).where(eq(bookTable.bibleId, bibleId));
		await db.delete(bibleTable).where(eq(bibleTable.id, bibleId));
	});

	it("stores each book once when first reads race", async () => {
		const { BookRepository } = await import("./BookRepository");

		const results = await Promise.all(
			Array.from({ length: 4 }, () => new BookRepository().getAllByBibleId(bibleId!)),
		);

		const stored = await db.select().from(bookTable).where(eq(bookTable.bibleId, bibleId!));
		expect(stored.map((b) => b.abbreviation).sort()).toEqual(["EXO", "GEN", "LEV"]);

		// Every racer hands back the stored rows, not its own unsaved copies, so
		// whatever a caller does with a book id points at a real row.
		const storedIds = stored.map((b) => b.id).sort();
		for (const books of results) {
			expect(books.map((b) => b.id).sort()).toEqual(storedIds);
		}
	});
});
