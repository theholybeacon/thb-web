"use server";

import { EntityRepository } from "../../repository/EntityRepository";
import { EntityContentRepository } from "../../repository/EntityContentRepository";

/** What a study's character step shows about a person. */
export type EntityCard = {
	slug: string;
	name: string;
	/** The profile's overview, when it has been written; null until then. */
	overview: string | null;
};

/**
 * A character profile in brief, for a character step. Read-only: it never
 * starts writing a profile that does not exist yet; the full profile page
 * (linked from the step) does that.
 */
export async function entityCardGetSS(slug: string): Promise<EntityCard | null> {
	const entity = await new EntityRepository().getBySlug(slug);
	if (!entity) return null;

	const content = await new EntityContentRepository().getByEntityId(entity.id);
	const overview = content?.generationStatus === "ready" ? content.overview?.trim() || null : null;

	return { slug: entity.slug, name: entity.name, overview };
}
