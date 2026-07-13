"use server";

import { ChapterMentions, EntityLite } from "../../model/Entity";
import { EntityRepository } from "../../repository/EntityRepository";

/**
 * Returns the people mentioned in a chapter (canonical bookAbbreviation + chapter),
 * both as a distinct list and mapped by verse number, for inline reader linking.
 */
export async function entityMentionsGetForChapterSS(
	bookAbbreviation: string,
	chapter: number,
): Promise<ChapterMentions> {
	const mentions = await new EntityRepository().getChapterMentions(
		bookAbbreviation.toUpperCase(),
		chapter,
	);

	const mentionsByVerse: Record<number, EntityLite[]> = {};
	const peopleById = new Map<string, EntityLite>();

	for (const m of mentions) {
		const lite: EntityLite = {
			id: m.entity.id,
			slug: m.entity.slug,
			name: m.entity.name,
			aliases: (m.entity.aliases as string[] | null) ?? [],
		};
		peopleById.set(lite.id, lite);
		(mentionsByVerse[m.verse] ??= []).push(lite);
	}

	const people = Array.from(peopleById.values()).sort((a, b) => a.name.localeCompare(b.name));

	return { people, mentionsByVerse };
}
