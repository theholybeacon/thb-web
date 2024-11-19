import { logger } from "@/app/_utils/logger";
import { IBibleDao } from "./IBibleDao";
import { bibleTable } from "@/db/schema/bible";
import { Bible } from "../model/Bible";
import { sql } from "drizzle-orm";
import { db } from "@/db";

const log = logger.child({ module: 'BiblePostgreSQLDao' });
export class BiblePostgreSQLDao implements IBibleDao {
	async getAll(): Promise<Bible[]> {
		log.trace("getAll");
		const output = await db.select().from(bibleTable);
		return output;
	}

	async create(bible: Bible): Promise<Bible> {
		log.trace("create");
		const returned = await db.insert(bibleTable).values(bible).returning();
		return returned[0];
	}

	async getByBibleId(id: string): Promise<Bible> {
		log.trace("getByBibleId");
		const returned = await db.select().from(bibleTable).where(sql`${bibleTable.id} = ${id}`);
		return returned[0];
	}
}
