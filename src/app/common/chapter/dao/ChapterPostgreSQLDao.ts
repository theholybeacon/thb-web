import { logger } from "@/app/utils/logger";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { Chapter, ChapterFull, ChapterInsert, ChapterVer } from "../model/Chapter";
import { chapterTable } from "@/db/schema/chapter";

const log = logger.child({ module: 'ChapterPostgreSQLDao' });
export class ChapterPostgreSQLDao {
	async create(chapter: ChapterInsert): Promise<Chapter> {
		log.trace("create");
		const returned = await db.insert(chapterTable).values(chapter).returning();
		return returned[0];
	}

	/**
	 * Gets the chapter row, creating it only if it is missing.
	 *
	 * Concurrent readers of a cold chapter used to race here and each INSERT a
	 * row, leaving duplicate (bookId, chapterNumber) pairs whose verses landed on
	 * whichever twin `findFirst` did not return — a chapter that then read as
	 * permanently empty. `onConflictDoNothing` plus a re-select makes the loser
	 * of the race adopt the winner's row instead of minting a second one.
	 */
	async ensure(bookId: string, chapterNumber: number): Promise<ChapterVer> {
		log.trace("ensure");

		// Read first: the overwhelmingly common case is an existing chapter, and
		// an unconditional INSERT would put a write on every single read.
		const existing = await this.getByBookIdAndChapterNumber(bookId, chapterNumber);
		if (existing) return existing;

		await db.insert(chapterTable).values({ bookId, chapterNumber }).onConflictDoNothing();
		const returned = await this.getByBookIdAndChapterNumber(bookId, chapterNumber);
		if (!returned) {
			throw new Error(`chapter ${bookId}/${chapterNumber} missing after ensure`);
		}
		return returned;
	}

	/**
	 * Writes only the bookkeeping columns.
	 *
	 * `update()` takes a whole Chapter, so callers holding a ChapterVer would
	 * push the loaded `verses` relation through drizzle's `set()` and rewrite
	 * every column to do it. This touches exactly what it names.
	 */
	async updateMeta(
		id: string,
		fields: Partial<Pick<Chapter, "numVerses" | "contentHash">>,
	): Promise<void> {
		log.trace("updateMeta");
		await db
			.update(chapterTable)
			.set({ ...fields, updatedAt: new Date() })
			.where(eq(chapterTable.id, id));
	}

	async getById(id: string): Promise<Chapter> {
		log.trace("getById");
		const returned = await db.query.chapterTable.findFirst({
			where: (eq(chapterTable.id, id)),
		});
		if (!returned) {
			throw ("Chapter not found")
		} else {
			return returned;
		}
	}

	async getAllByBookId(bookId: string): Promise<Chapter[]> {
		const returned = await db.query.chapterTable.findMany({
			where: (
				and(
					eq(chapterTable.bookId, bookId),
				)),
		});
		if (!returned) {
			throw ("Chapters not found")
		} else {
			return returned;
		}
	}

	async getByBookIdAndChapterNumber(bookId: string, chapterNumber: number): Promise<ChapterVer | undefined> {
		log.trace("getByBookIdAndChapterNumber");
		const returned = await db.query.chapterTable.findFirst({
			where: (
				and(
					eq(chapterTable.bookId, bookId),
					eq(chapterTable.chapterNumber, chapterNumber),
				)),
			// Verses are inserted in fetch order, which a repair or a concurrent
			// write can break. Every reading mode, the JSON-LD text and the meta
			// description all trust this order, so it is enforced here.
			with: { verses: { orderBy: (v, { asc }) => [asc(v.verseNumber)] } }
		});
		return returned;
	}

	async getByIdWithBook(id: string): Promise<ChapterFull | null> {
		log.trace("getByIdWithBook");
		const returned = await db.query.chapterTable.findFirst({
			where: eq(chapterTable.id, id),
			with: {
				verses: { orderBy: (v, { asc }) => [asc(v.verseNumber)] },
				book: true
			}
		});
		return returned as ChapterFull | null;
	}

	async update(chapter: Chapter): Promise<void> {
		await db.update(chapterTable).set(chapter).where(eq(chapterTable.id, chapter.id));
	}
}

