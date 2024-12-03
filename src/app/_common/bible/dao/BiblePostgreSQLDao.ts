import { logger } from "@/app/_utils/logger";
import { bibleTable } from "@/db/schema/bible";
import { Bible, BibleInsert } from "../model/Bible";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";

const log = logger.child({ module: 'BiblePostgreSQLDao' });
export class BiblePostgreSQLDao {
	async getAll(): Promise<Bible[]> {
		log.trace("getAll");
		const output = await db.select().from(bibleTable);
		return output;
	}

	async create(bible: BibleInsert): Promise<Bible> {
		log.trace("create");
		const returned = await db.insert(bibleTable).values(bible).returning();
		return returned[0];
	}

	async getById(id: string): Promise<Bible | undefined> {
		log.trace("getById");
		return await db.query.bibleTable.findFirst({
			where: eq(bibleTable.id, id),
		});
	}

	async updateBookNumber(n: number, bibleId: string): Promise<void> {
		log.trace("updateBookNumber");

		await db.update(bibleTable).set({
			numBooks: n
		}).where(eq(bibleTable.id, bibleId));


	}
}
