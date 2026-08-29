import { ContentRef, EntityContent, Relationship } from "../model/EntityContent";
import { EntityContentRepository } from "../repository/EntityContentRepository";
import { EntityRepository } from "../repository/EntityRepository";
import { EntityContentAIDao } from "../dao/EntityContentAIDao";

/**
 * Generates one character's content, with no opinion about who asked.
 *
 * Lifted out of entityContentEnsureSS so the same code serves both callers: the
 * reader's page (which gates on a signed-in session) and the backfill script
 * (which runs on a CLI and has no session to check). The citation filtering
 * below is the part that must never fork — a second copy would drift, and the
 * whole trustworthiness claim rests on it.
 *
 * NOT a `"use server"` module on purpose: that directive restricts a file to
 * async exports and marks everything in it as a server action, neither of which
 * is wanted for a plain internal helper. Same reasoning as chapterLoad.ts.
 *
 * Callers own authorization. This function performs none.
 */

function refToString(r: ContentRef): string {
	return `${r.bookAbbreviation} ${r.chapter}:${r.verse}`;
}

/** The AI is only ever shown this many of an entity's real references. */
const MAX_REFERENCES = 200;

export type EntityContentGenerateResult = {
	/** False when another worker already held the generation lock. */
	generated: boolean;
	content: EntityContent | null;
};

export async function entityContentGenerate(
	entityId: string,
): Promise<EntityContentGenerateResult> {
	const contentRepo = new EntityContentRepository();

	await contentRepo.ensureRow(entityId);

	// The row IS the lock: a conditional UPDATE flips pending -> generating, so
	// exactly one generation runs even if the page and the backfill script reach
	// the same character at the same moment.
	const won = await contentRepo.claimForGeneration(entityId);
	if (!won) {
		return { generated: false, content: await contentRepo.getByEntityId(entityId) };
	}

	try {
		const entityRepo = new EntityRepository();
		const entity = await entityRepo.getById(entityId);
		if (!entity) {
			await contentRepo.markFailed(entityId, "entity not found");
			return { generated: false, content: await contentRepo.getByEntityId(entityId) };
		}

		const mentions = await entityRepo.getMentionsByEntityId(entityId);
		const refMap = new Map<string, ContentRef>();
		for (const m of mentions) {
			const ref: ContentRef = {
				bookAbbreviation: m.bookAbbreviation,
				chapter: m.chapter,
				verse: m.verse,
			};
			const key = refToString(ref);
			if (!refMap.has(key)) refMap.set(key, ref);
		}
		const referenceList = Array.from(refMap.keys()).slice(0, MAX_REFERENCES);

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

	return { generated: true, content: await contentRepo.getByEntityId(entityId) };
}
