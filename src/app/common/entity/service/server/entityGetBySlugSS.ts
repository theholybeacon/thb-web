"use server";

import { Entity } from "../../model/Entity";
import { EntityRepository } from "../../repository/EntityRepository";

export async function entityGetBySlugSS(slug: string): Promise<Entity | null> {
	return await new EntityRepository().getBySlug(slug);
}
