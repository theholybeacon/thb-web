import { logger } from "@/app/_utils/logger";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { Chapter, ChapterInsert, ChapterVer } from "../model/Chapter";
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

	async getByBookIdAndChapterNumber(bookId: string, chapterNumber: number): Promise<ChapterVer> {
		log.trace("getByBookIdAndChapterNumber");
		const returned = await db.query.chapterTable.findFirst({
			where: (
				and(
					eq(chapterTable.bookId, bookId),
					eq(chapterTable.chapterNumber, chapterNumber),
				)),
			with: { verses: true }
		});
		if (!returned) {
			throw ("Chapter not found")
		} else {
			return returned;
		}
	}
}

