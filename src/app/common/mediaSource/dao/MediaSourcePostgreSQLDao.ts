import { logger } from "@/app/utils/logger";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { mediaSourceTable } from "@/db/schema/mediaSource";
import { MediaSource, MediaSourceInsert } from "../model/MediaSource";

const log = logger.child({ module: "MediaSourcePostgreSQLDao" });

export class MediaSourcePostgreSQLDao {
	async getAll(): Promise<MediaSource[]> {
		log.trace("getAll");
		return await db.select().from(mediaSourceTable).orderBy(asc(mediaSourceTable.kind), asc(mediaSourceTable.name));
	}

	async create(source: MediaSourceInsert): Promise<MediaSource> {
		log.trace("create");
		const returned = await db.insert(mediaSourceTable).values(source).returning();
		return returned[0];
	}

	async delete(id: string): Promise<void> {
		log.trace("delete");
		await db.delete(mediaSourceTable).where(eq(mediaSourceTable.id, id));
	}
}
