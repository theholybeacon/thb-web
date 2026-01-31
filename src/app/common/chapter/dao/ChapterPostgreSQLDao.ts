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
			with: { verses: true }
		});
		return returned;
	}

	async getByIdWithBook(id: string): Promise<ChapterFull | null> {
		log.trace("getByIdWithBook");
		const returned = await db.query.chapterTable.findFirst({
			where: eq(chapterTable.id, id),
			with: {
				verses: true,
				book: true
			}
		});
		return returned as ChapterFull | null;
	}

	async update(chapter: Chapter): Promise<void> {
		await db.update(chapterTable).set(chapter).where(eq(chapterTable.id, chapter.id));
	}
}

