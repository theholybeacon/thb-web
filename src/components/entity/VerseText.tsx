import type { ReactNode } from "react";
import type { EntityLite } from "@/app/common/entity/model/Entity";
import { CharacterName } from "./CharacterName";

function escapeRegExp(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface VerseLinkOptions {
	/** Whether character names should link to their page (premium) or be locked. */
	interactive?: boolean;
	/** Invoked when a non-premium user clicks a locked name. */
	onLockedClick?: () => void;
}

/**
 * Renders verse text with character names/aliases (that the mention index says
 * appear in this verse) wrapped as character links. Falls back to the plain
 * string when there are no entities to link — safe because verse content is a
 * single plain string. Names are always shown; interactivity is gated via opts.
 */
export function renderVerseContent(
	content: string,
	entities?: EntityLite[],
	opts?: VerseLinkOptions,
): ReactNode {
	if (!entities || entities.length === 0) return content;

	const interactive = opts?.interactive ?? true;

	// Build term -> slug, longest terms first so "John the Baptist" wins over "John".
	const terms: { term: string; slug: string }[] = [];
	for (const e of entities) {
		for (const term of [e.name, ...(e.aliases ?? [])]) {
			if (term && term.trim()) terms.push({ term: term.trim(), slug: e.slug });
		}
	}
	if (terms.length === 0) return content;
	terms.sort((a, b) => b.term.length - a.term.length);

	const slugByLowerTerm = new Map<string, string>();
	for (const t of terms) if (!slugByLowerTerm.has(t.term.toLowerCase())) slugByLowerTerm.set(t.term.toLowerCase(), t.slug);

	const pattern = new RegExp(`\\b(${terms.map((t) => escapeRegExp(t.term)).join("|")})\\b`, "gi");

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
				<CharacterName
					key={key++}
					slug={slug}
					variant="inline"
					interactive={interactive}
					onLockedClick={opts?.onLockedClick}
				>
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
