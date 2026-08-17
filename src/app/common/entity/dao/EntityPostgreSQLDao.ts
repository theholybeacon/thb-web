import { logger } from "@/app/utils/logger";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { entityTable } from "@/db/schema/entity";
import { entityMentionTable } from "@/db/schema/entityMention";
import { Entity, EntityIndexRow, EntityInsert, EntityMention, EntityMentionInsert } from "../model/Entity";

const log = logger.child({ module: "EntityPostgreSQLDao" });

export class EntityPostgreSQLDao {
	async getBySlug(slug: string): Promise<Entity | null> {
		log.trace("getBySlug");
		const rows = await db.select().from(entityTable).where(eq(entityTable.slug, slug)).limit(1);
		return rows[0] ?? null;
	}

	async getById(id: string): Promise<Entity | null> {
		const rows = await db.select().from(entityTable).where(eq(entityTable.id, id)).limit(1);
		return rows[0] ?? null;
	}

	async getMentionsByEntityId(entityId: string): Promise<EntityMention[]> {
		log.trace("getMentionsByEntityId");
		return await db.select().from(entityMentionTable).where(eq(entityMentionTable.entityId, entityId));
	}

	/** Case-insensitive exact-name lookup — best-effort resolution for relationships. */
	async getByName(name: string): Promise<Entity | null> {
		const rows = await db
			.select()
			.from(entityTable)
			.where(sql`lower(${entityTable.name}) = ${name.toLowerCase()}`)
			.limit(1);
		return rows[0] ?? null;
	}

	/** All mentions in a chapter, joined with their entity — powers reader linking. */
	async getChapterMentions(
		bookAbbreviation: string,
		chapter: number,
	): Promise<(EntityMention & { entity: Entity })[]> {
		log.trace("getChapterMentions");
		return await db.query.entityMentionTable.findMany({
			where: and(
				eq(entityMentionTable.bookAbbreviation, bookAbbreviation),
				eq(entityMentionTable.chapter, chapter),
			),
			with: { entity: true },
		});
	}

	async getAllSlugs(): Promise<string[]> {
		const rows = await db.select({ slug: entityTable.slug }).from(entityTable);
		return rows.map((r) => r.slug);
	}

	/** Slugs of entities with at least `minMentions` verse mentions — the SEO-indexable set. */
	async getSlugsWithMinMentions(minMentions: number): Promise<string[]> {
		const rows = await db
			.select({ slug: entityTable.slug })
			.from(entityTable)
			.innerJoin(entityMentionTable, eq(entityMentionTable.entityId, entityTable.id))
			.groupBy(entityTable.id, entityTable.slug)
			.having(sql`count(*) >= ${minMentions}`);
		return rows.map((r) => r.slug);
	}

	/**
	 * A page of the browsable character index, ordered by scriptural presence
	 * first so the people readers actually look for lead each letter, then
	 * alphabetically. `mentionCount` lets the page mark the thin tail, matching
	 * the noindex policy in CHARACTER_INDEX_MIN_MENTIONS.
	 */
	async listForIndex(opts: {
		letter?: string;
		query?: string;
		limit: number;
		offset: number;
	}): Promise<{ rows: EntityIndexRow[]; total: number }> {
		log.trace("listForIndex");

		const filters = [];
		if (opts.letter) filters.push(sql`upper(left(${entityTable.name}, 1)) = ${opts.letter.toUpperCase()}`);
		if (opts.query) filters.push(sql`${entityTable.name} ILIKE ${`%${opts.query}%`}`);
		const where = filters.length ? and(...filters) : undefined;

		const rows = await db
			.select({
				slug: entityTable.slug,
				name: entityTable.name,
				gender: entityTable.gender,
				mentionCount: sql<number>`count(${entityMentionTable.id})::int`,
			})
			.from(entityTable)
			.leftJoin(entityMentionTable, eq(entityMentionTable.entityId, entityTable.id))
			.where(where)
			.groupBy(entityTable.id, entityTable.slug, entityTable.name, entityTable.gender)
			.orderBy(sql`count(${entityMentionTable.id}) DESC`, entityTable.name)
			.limit(opts.limit)
			.offset(opts.offset);

		const totalRows = await db
			.select({ n: sql<number>`count(*)::int` })
			.from(entityTable)
			.where(where);

		return { rows, total: totalRows[0]?.n ?? 0 };
	}

	/** Initial letters that actually have characters behind them, for the A-Z filter. */
	async listIndexLetters(): Promise<string[]> {
		const rows = await db
			.select({ letter: sql<string>`upper(left(${entityTable.name}, 1))` })
			.from(entityTable)
			.groupBy(sql`upper(left(${entityTable.name}, 1))`)
			.orderBy(sql`upper(left(${entityTable.name}, 1))`);
		return rows.map((r) => r.letter).filter((l) => /^[A-Z]$/.test(l));
	}

	async countMentions(entityId: string): Promise<number> {
		const rows = await db
			.select({ n: sql<number>`count(*)::int` })
			.from(entityMentionTable)
			.where(eq(entityMentionTable.entityId, entityId));
		return rows[0]?.n ?? 0;
	}

	// --- Import helpers (idempotent) ---

	async upsertByDatasetId(entity: EntityInsert): Promise<Entity> {
		const rows = await db
			.insert(entityTable)
			.values(entity)
			.onConflictDoUpdate({
				target: entityTable.datasetId,
				set: {
					name: entity.name,
					slug: entity.slug,
					aliases: entity.aliases,
					gender: entity.gender,
					birthYear: entity.birthYear,
					deathYear: entity.deathYear,
					updatedAt: new Date(),
				},
			})
			.returning();
		return rows[0];
	}

	async insertMentionsIgnore(mentions: EntityMentionInsert[]): Promise<void> {
		if (mentions.length === 0) return;
		await db.insert(entityMentionTable).values(mentions).onConflictDoNothing();
	}
}
