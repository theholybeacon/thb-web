import { logger } from "../../../utils/logger";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { Verse, VerseInsert } from "../model/Verse";
import { verseTable } from "@/db/schema/verse";
import { ChapterRepository } from "../../chapter/repository/ChapterRepository";

const log = logger.child({ module: 'VersePostgreSQLDao' });
export class VersePostgreSQLDao {

	async create(verse: VerseInsert): Promise<Verse> {
		log.trace("create");
		const returned = await db.insert(verseTable).values(verse).returning();
		return returned[0];
	}

	async getById(id: string): Promise<Verse> {
		log.trace("getById");
		const returned = await db.query.verseTable.findFirst({
			where: (eq(verseTable.id, id)),
		});
		if (!returned) {
			throw ("Verse not found")
		} else {
			return returned;
		}
	}

	async getByChapterIdAndVerseNumber(chapterId: string, verseNumber: number): Promise<Verse> {
		log.trace("getByChapterIdAndVerseNumber");

		const returned = await db.query.verseTable.findFirst({
			where: and(
				eq(verseTable.chapterId, chapterId),
				eq(verseTable.verseNumber, verseNumber),
			),
		});
		if (!returned) {
			const chapterRepository = new ChapterRepository();
			const chapter = await chapterRepository.getById(chapterId);

			await chapterRepository.getFullChapter(chapter.bookId, chapter.chapterNumber);
			const returned = await db.query.verseTable.findFirst({
				where: and(
					eq(verseTable.chapterId, chapterId),
					eq(verseTable.verseNumber, verseNumber),
				),
			});
			if (!returned) {
				throw ("Verse not found")
			}
			return returned;

		} else {
			return returned;
		}
	}
}

