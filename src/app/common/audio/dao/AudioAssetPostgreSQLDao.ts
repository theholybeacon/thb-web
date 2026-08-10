import { logger } from "@/app/utils/logger";
import { and, eq, inArray, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { audioAssetTable } from "@/db/schema/audioAsset";
import { AudioAsset, AudioAssetInsert } from "../model/AudioAsset";

const log = logger.child({ module: "AudioAssetPostgreSQLDao" });

export class AudioAssetPostgreSQLDao {
	async getByCacheKey(cacheKey: string): Promise<AudioAsset | null> {
		const rows = await db
			.select()
			.from(audioAssetTable)
			.where(eq(audioAssetTable.cacheKey, cacheKey))
			.limit(1);
		return rows[0] ?? null;
	}

	async getManyByCacheKeys(cacheKeys: string[]): Promise<AudioAsset[]> {
		if (cacheKeys.length === 0) return [];
		return await db.select().from(audioAssetTable).where(inArray(audioAssetTable.cacheKey, cacheKeys));
	}

	/** Ensure a row exists (starts in `pending`) without disturbing an existing one. */
	async ensureRow(row: AudioAssetInsert): Promise<void> {
		await db.insert(audioAssetTable).values(row).onConflictDoNothing();
	}

	/**
	 * Atomically claim generation. Returns true only for the caller that flips the
	 * row from pending/failed → generating (a per-statement lock — safe without an
	 * interactive transaction on the Neon HTTP driver).
	 */
	async claimForGeneration(cacheKey: string): Promise<boolean> {
		const rows = await db
			.update(audioAssetTable)
			.set({ generationStatus: "generating", error: null, updatedAt: new Date() })
			.where(
				and(
					eq(audioAssetTable.cacheKey, cacheKey),
					inArray(audioAssetTable.generationStatus, ["pending", "failed"]),
				),
			)
			.returning({ id: audioAssetTable.id });
		return rows.length > 0;
	}

	async markReady(cacheKey: string, data: Partial<AudioAsset>): Promise<void> {
		await db
			.update(audioAssetTable)
			.set({
				...data,
				generationStatus: "ready",
				error: null,
				generatedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(audioAssetTable.cacheKey, cacheKey));
	}

	async markFailed(cacheKey: string, error: string): Promise<void> {
		log.warn({ cacheKey, error }, "audio generation failed");
		await db
			.update(audioAssetTable)
			.set({ generationStatus: "failed", error, updatedAt: new Date() })
			.where(eq(audioAssetTable.cacheKey, cacheKey));
	}

	/**
	 * Releases rows stranded in `generating` by a crashed or timed-out function.
	 *
	 * Chapter generation is a multi-minute, multi-call job (unlike entity content's
	 * single ~5s chat call), so a mid-flight death is a real possibility. Without
	 * this, one crash would wedge a chapter in `generating` forever and no user
	 * could ever listen to it again.
	 */
	async reclaimStale(olderThanMs: number): Promise<number> {
		const cutoff = new Date(Date.now() - olderThanMs);
		const rows = await db
			.update(audioAssetTable)
			.set({ generationStatus: "pending", error: "reclaimed: generation timed out", updatedAt: new Date() })
			.where(
				and(
					eq(audioAssetTable.generationStatus, "generating"),
					lt(audioAssetTable.updatedAt, cutoff),
				),
			)
			.returning({ id: audioAssetTable.id });
		if (rows.length > 0) log.warn({ count: rows.length }, "reclaimed stale audio generations");
		return rows.length;
	}

	/** Total bytes stored — for cost monitoring. */
	async totalBytes(): Promise<number> {
		const rows = await db
			.select({ total: sql<number>`coalesce(sum(${audioAssetTable.byteSize}), 0)` })
			.from(audioAssetTable);
		return Number(rows[0]?.total ?? 0);
	}
}
