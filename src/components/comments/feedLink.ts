import { buildNoteHref } from "@/app/common/note/noteScope";
import type { CommunityFeedItem } from "@/app/common/community/model/CommunityFeed";

export type FeedLink = { href: string; label: string; kind: "scripture" | "entity" } | null;

/**
 * Where a feed row points back to, for either anchor kind.
 *
 * Scripture rows carry the same four denormalized fields `buildNoteHref` wants
 * (bibleSlug / bookSlug / chapter / verse), so the reader URL is built here with
 * no lookup and is self-consistent across translations by construction. Entity
 * rows carry only entityId, so the feed query joins the character's slug and
 * name — /bible/people/[slug] resolves by slug.
 *
 * Null when neither is reachable: a translation removed since the post leaves
 * bibleSlug null, which buildNoteHref already returns null for. The caller
 * simply renders no link.
 */
export function buildFeedLink(item: CommunityFeedItem): FeedLink {
	if (item.entity) {
		return { href: `/bible/people/${item.entity.slug}`, label: item.entity.name, kind: "entity" };
	}
	// buildNoteHref already degrades across all four scopes: /bible/{slug} ->
	// .../{book} -> .../{chapter} -> ...#verse-{n}.
	const href = buildNoteHref(item);
	if (!href) return null;
	return { href, label: item.reference ?? "", kind: "scripture" };
}
