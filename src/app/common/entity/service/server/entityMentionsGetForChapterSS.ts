"use server";

import { ChapterMentions, EntityLite } from "../../model/Entity";
import { EntityRepository } from "../../repository/EntityRepository";

/**
 * Returns the people mentioned in a chapter (canonical bookAbbreviation + chapter),
 * both as a distinct list and mapped by verse number, for inline reader linking.
 *
 * `lang` (ISO 639-1 of the translation being read) merges that language's
 * localized names into `aliases`, so "Moïse" links in a French chapter. The
 * dataset names stay in the list — many are spelled identically across
 * languages ("David", "Abraham").
 */
export async function entityMentionsGetForChapterSS(
	bookAbbreviation: string,
	chapter: number,
	lang?: string | null,
): Promise<ChapterMentions> {
	const repo = new EntityRepository();
	const mentions = await repo.getChapterMentions(bookAbbreviation.toUpperCase(), chapter);

	const entityIds = Array.from(new Set(mentions.map((m) => m.entity.id)));
	// Localized names are an enhancement: if the lookup fails, link by the
	// dataset names rather than failing the whole chapter.
	const localized =
		lang && lang !== "en"
			? await repo.getLocalizedAliases(entityIds, lang).catch(() => new Map<string, string[]>())
			: new Map<string, string[]>();

	const mentionsByVerse: Record<number, EntityLite[]> = {};
	const peopleById = new Map<string, EntityLite>();

	for (const m of mentions) {
		const lite: EntityLite = {
			id: m.entity.id,
			slug: m.entity.slug,
			name: m.entity.name,
			aliases: [...((m.entity.aliases as string[] | null) ?? []), ...(localized.get(m.entity.id) ?? [])],
		};
		peopleById.set(lite.id, lite);
		(mentionsByVerse[m.verse] ??= []).push(lite);
	}

	const people = Array.from(peopleById.values()).sort((a, b) => a.name.localeCompare(b.name));

	return { people, mentionsByVerse };
}
