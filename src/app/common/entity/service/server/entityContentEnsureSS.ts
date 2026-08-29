"use server";

import { auth } from "@clerk/nextjs/server";
import { EntityContent } from "../../model/EntityContent";
import { EntityContentRepository } from "../../repository/EntityContentRepository";
import { entityContentGenerate } from "../entityContentGenerate";

/**
 * Lazily generates a character's AI content, cached forever. Only signed-in
 * users trigger generation; a conditional-UPDATE lock ensures exactly one
 * generation runs even under concurrent loads. Citations are filtered to the
 * entity's real mentions so nothing is fabricated. Returns the current row.
 *
 * The generation itself lives in ../entityContentGenerate so the backfill script
 * can reach it without a session. This function is the authorization boundary
 * and nothing else — keep it that way.
 */
export async function entityContentEnsureSS(entityId: string): Promise<EntityContent | null> {
	const { userId } = await auth();

	// Anonymous users never trigger generation — they see whatever is cached.
	if (!userId) {
		return await new EntityContentRepository().getByEntityId(entityId);
	}

	const { content } = await entityContentGenerate(entityId);
	return content;
}
