import type { ReactNode } from "react";
import type { EntityLite } from "@/app/common/entity/model/Entity";
import { buildNamePattern, normalizeName } from "@/lib/nameMatch";
import { CharacterName } from "./CharacterName";

/**
 * Renders verse text with character names/aliases (that the mention index says
 * appear in this verse) wrapped as character links. Falls back to the plain
 * string when there are no entities to link — safe because verse content is a
 * single plain string.
 */
export function renderVerseContent(rawContent: string, entities?: EntityLite[]): ReactNode {
	if (!entities || entities.length === 0) return rawContent;
	const content = rawContent.normalize("NFC");

	// Build term -> slug, longest terms first so "John the Baptist" wins over "John".
	const terms: { term: string; slug: string }[] = [];
	for (const e of entities) {
		for (const term of [e.name, ...(e.aliases ?? [])]) {
			const normalized = term ? normalizeName(term) : "";
			if (normalized) terms.push({ term: normalized, slug: e.slug });
		}
	}
	if (terms.length === 0) return content;
	terms.sort((a, b) => b.term.length - a.term.length);

	const slugByLowerTerm = new Map<string, string>();
	for (const t of terms) if (!slugByLowerTerm.has(t.term.toLowerCase())) slugByLowerTerm.set(t.term.toLowerCase(), t.slug);

	const pattern = buildNamePattern(terms.map((t) => t.term));
	if (!pattern) return content;

	const nodes: ReactNode[] = [];
	let lastIndex = 0;
	let key = 0;
	let match: RegExpExecArray | null;
	while ((match = pattern.exec(content)) !== null) {
		const matched = match[0];
		const start = match.index;
		if (start > lastIndex) nodes.push(content.slice(lastIndex, start));

		const slug = slugByLowerTerm.get(matched.toLowerCase());
		if (slug) {
			nodes.push(
				<CharacterName key={key++} slug={slug} variant="inline">
					{matched}
				</CharacterName>,
			);
		} else {
			nodes.push(matched);
		}

		lastIndex = start + matched.length;
		if (pattern.lastIndex === start) pattern.lastIndex++; // guard against zero-length matches
	}
	if (lastIndex < content.length) nodes.push(content.slice(lastIndex));

	return nodes;
}
