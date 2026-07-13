"use server";

import { EntityContent } from "../../model/EntityContent";
import { EntityContentRepository } from "../../repository/EntityContentRepository";

/** Read-only fetch of an entity's generated content (server-rendered for SEO). */
export async function entityContentGetSS(entityId: string): Promise<EntityContent | null> {
	return await new EntityContentRepository().getByEntityId(entityId);
}
