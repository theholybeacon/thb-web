import { logger } from "@/app/utils/logger";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { entityContentTable } from "@/db/schema/entityContent";
import { entityContentFlagTable } from "@/db/schema/entityContentFlag";
import { EntityContent, EntityContentFlagInsert } from "../model/EntityContent";

const log = logger.child({ module: "EntityContentPostgreSQLDao" });

export class EntityContentPostgreSQLDao {
	async getByEntityId(entityId: string): Promise<EntityContent | null> {
		const rows = await db
			.select()
			.from(entityContentTable)
			.where(eq(entityContentTable.entityId, entityId))
			.limit(1);
		return rows[0] ?? null;
	}

	/** Ensure a row exists (starts in `pending`) without disturbing an existing one. */
	async ensureRow(entityId: string): Promise<void> {
		await db.insert(entityContentTable).values({ entityId }).onConflictDoNothing();
	}

	/**
	 * Atomically claim generation. Returns true only for the caller that flips the
	 * row from pending/failed → generating (a per-statement lock — safe without an
	 * interactive transaction on the Neon HTTP driver).
	 */
	async claimForGeneration(entityId: string): Promise<boolean> {
		const rows = await db
			.update(entityContentTable)
			.set({ generationStatus: "generating", error: null, updatedAt: new Date() })
			.where(
				and(
					eq(entityContentTable.entityId, entityId),
					inArray(entityContentTable.generationStatus, ["pending", "failed"]),
				),
			)
			.returning({ id: entityContentTable.id });
		return rows.length > 0;
	}

	async markReady(entityId: string, data: Partial<EntityContent>): Promise<void> {
		await db
			.update(entityContentTable)
			.set({
				...data,
				generationStatus: "ready",
				error: null,
				generatedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(entityContentTable.entityId, entityId));
	}

	async markFailed(entityId: string, error: string): Promise<void> {
		log.warn({ entityId, error }, "entity content generation failed");
		await db
			.update(entityContentTable)
			.set({ generationStatus: "failed", error, updatedAt: new Date() })
			.where(eq(entityContentTable.entityId, entityId));
	}

	async createFlag(flag: EntityContentFlagInsert): Promise<void> {
		await db.insert(entityContentFlagTable).values(flag);
	}
}
