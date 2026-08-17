import { entityTable } from "@/db/schema/entity";
import { entityMentionTable } from "@/db/schema/entityMention";

export type EntityInsert = typeof entityTable.$inferInsert;
export type Entity = typeof entityTable.$inferSelect;

export type EntityMentionInsert = typeof entityMentionTable.$inferInsert;
export type EntityMention = typeof entityMentionTable.$inferSelect;

/** Lightweight entity shape used for reader linking + people lists. */
export type EntityLite = {
	id: string;
	slug: string;
	name: string;
	aliases: string[];
};

/** Distinct people in a chapter + a per-verse-number map, for reader linking. */
export type ChapterMentions = {
	people: EntityLite[];
	mentionsByVerse: Record<number, EntityLite[]>;
};

/** A row of the browsable character index at /bible/people. */
export type EntityIndexRow = {
	slug: string;
	name: string;
	gender: string | null;
	mentionCount: number;
};

/** A page of the browsable character index, plus the letters that have entries. */
export type EntityIndexPage = {
	rows: EntityIndexRow[];
	total: number;
	letters: string[];
	page: number;
	pageSize: number;
};

export const ENTITY_INDEX_PAGE_SIZE = 60;
