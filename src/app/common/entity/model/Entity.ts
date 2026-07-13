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
