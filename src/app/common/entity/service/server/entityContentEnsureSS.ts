"use server";

import { auth } from "@clerk/nextjs/server";
import { EntityContent, ContentRef, Relationship } from "../../model/EntityContent";
import { EntityContentRepository } from "../../repository/EntityContentRepository";
import { EntityRepository } from "../../repository/EntityRepository";
import { EntityContentAIDao } from "../../dao/EntityContentAIDao";

function refToString(r: ContentRef): string {
	return `${r.bookAbbreviation} ${r.chapter}:${r.verse}`;
}

/**
 * Lazily generates a character's AI content, cached forever. Only signed-in
 * users trigger generation; a conditional-UPDATE lock ensures exactly one
 * generation runs even under concurrent loads. Citations are filtered to the
 * entity's real mentions so nothing is fabricated. Returns the current row.
 */
export async function entityContentEnsureSS(entityId: string): Promise<EntityContent | null> {
	const contentRepo = new EntityContentRepository();
	const { userId } = await auth();

	// Anonymous users never trigger generation — they see whatever is cached.
	if (!userId) {
		return await contentRepo.getByEntityId(entityId);
	}

	await contentRepo.ensureRow(entityId);
	const won = await contentRepo.claimForGeneration(entityId);
	if (!won) {
		// Someone else is generating, or it's already ready/generating.
		return await contentRepo.getByEntityId(entityId);
	}

	try {
		const entityRepo = new EntityRepository();
		const entity = await entityRepo.getById(entityId);
		if (!entity) {
			await contentRepo.markFailed(entityId, "entity not found");
			return await contentRepo.getByEntityId(entityId);
		}

		const mentions = await entityRepo.getMentionsByEntityId(entityId);
		const refMap = new Map<string, ContentRef>();
		for (const m of mentions) {
			const ref: ContentRef = { bookAbbreviation: m.bookAbbreviation, chapter: m.chapter, verse: m.verse };
			const key = refToString(ref);
			if (!refMap.has(key)) refMap.set(key, ref);
		}
		const referenceList = Array.from(refMap.keys()).slice(0, 200);

		const dto = await new EntityContentAIDao().generate({
			name: entity.name,
			aliases: (entity.aliases as string[] | null) ?? [],
			references: referenceList,
		});

		// Filter every cited ref against the real mention set (drop fabrications).
		let allValid = true;
		const mapRefs = (strings: string[]): ContentRef[] => {
			const out: ContentRef[] = [];
			for (const s of strings) {
				const r = refMap.get(s.trim());
				if (r) out.push(r);
				else allValid = false;
			}
			return out;
		};

		const overviewRefs = dto.overview ? mapRefs(dto.overview.refs) : [];
		const significanceRefs = dto.significance ? mapRefs(dto.significance.refs) : [];
		const timeline = dto.timeline.map((e) => ({
			title: e.title,
			description: e.description,
			refs: mapRefs(e.refs),
		}));

		const relationships: Relationship[] = [];
		for (const rel of dto.relationships) {
			const refs = mapRefs(rel.refs);
			const match = rel.name ? await entityRepo.getByName(rel.name) : null;
			relationships.push({ name: rel.name, relation: rel.relation, refs, entitySlug: match?.slug });
		}

		await contentRepo.markReady(entityId, {
			model: "gpt-4o-mini",
			overview: dto.overview?.text?.trim() || null,
			overviewRefs,
			significance: dto.significance?.text?.trim() || null,
			significanceRefs,
			timeline,
			relationships,
			citationsValid: allValid,
		});
	} catch (err) {
		await contentRepo.markFailed(entityId, err instanceof Error ? err.message : String(err));
	}

	return await contentRepo.getByEntityId(entityId);
}
