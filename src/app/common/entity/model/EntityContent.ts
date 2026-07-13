import { z } from "zod";
import { entityContentTable } from "@/db/schema/entityContent";
import { entityContentFlagTable } from "@/db/schema/entityContentFlag";

export type EntityContent = typeof entityContentTable.$inferSelect;
export type EntityContentInsert = typeof entityContentTable.$inferInsert;
export type EntityContentFlagInsert = typeof entityContentFlagTable.$inferInsert;
export type { ContentRef, TimelineEvent, Relationship } from "@/db/schema/entityContent";

/**
 * Shape the AI must return. Refs are STRINGS that must exactly match one of the
 * canonical reference strings we supply (e.g. "GEN 12:1"); the service filters
 * them against the entity's real mentions before storing, so citations can't be
 * fabricated.
 */
const aiSectionSchema = z.object({
	text: z.string().default(""),
	refs: z.array(z.string()).default([]),
});
const aiTimelineEventSchema = z.object({
	title: z.string(),
	description: z.string().default(""),
	refs: z.array(z.string()).default([]),
});
const aiRelationshipSchema = z.object({
	name: z.string(),
	relation: z.string().default(""),
	refs: z.array(z.string()).default([]),
});

export const entityContentAISchema = z.object({
	overview: aiSectionSchema.optional(),
	significance: aiSectionSchema.optional(),
	timeline: z.array(aiTimelineEventSchema).default([]),
	relationships: z.array(aiRelationshipSchema).default([]),
});

export type EntityContentAIDTO = z.infer<typeof entityContentAISchema>;

export type EntityContentGenerationInput = {
	name: string;
	aliases: string[];
	references: string[];
};
