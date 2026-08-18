"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { BookOpen, MessagesSquare, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ContributionItem } from "@/components/community/ContributionItem";
import type { RefLinkMap } from "@/components/entity/CitationLinks";
import type { CommunityFeedItem } from "@/app/common/community/model/CommunityFeed";
import { buildFeedLink } from "./feedLink";

/** "3d", "5h", "just now" — compact enough to sit in a card header. */
function relativeAge(date: Date | string): string {
	const then = typeof date === "string" ? new Date(date) : date;
	const mins = Math.floor((Date.now() - then.getTime()) / 60000);
	if (mins < 1) return "now";
	if (mins < 60) return `${mins}m`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours}h`;
	const days = Math.floor(hours / 24);
	if (days < 30) return `${days}d`;
	const months = Math.floor(days / 30);
	if (months < 12) return `${months}mo`;
	return `${Math.floor(months / 12)}y`;
}

/**
 * One feed row: the anchor context the reader and character pages give for
 * free, wrapped around the shared ContributionItem.
 *
 * ContributionItem is used unmodified — it already renders votes, the kind
 * badge, the body, citations, Comment / Report / Delete and the nested
 * CommentThread, and everything it needs comes from the CommunityContext the
 * feed provides. Thread truncation happens server-side, so it does not need to
 * know it is in a feed.
 */
export function FeedItemCard({
	item,
	linkMap,
	bibleName,
}: {
	item: CommunityFeedItem;
	linkMap: RefLinkMap;
	bibleName?: string;
}) {
	const t = useTranslations("comments");
	const link = buildFeedLink(item);
	const hidden = item.totalComments - item.comments.length;

	return (
		<Card className="gap-0 p-4">
			<div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
				{link ? (
					<Link
						href={link.href}
						className="inline-flex min-w-0 items-center gap-1 font-medium text-primary hover:underline"
					>
						{link.kind === "entity" ? (
							<User className="h-3 w-3 shrink-0" />
						) : (
							<BookOpen className="h-3 w-3 shrink-0" />
						)}
						<span className="truncate">
							{link.kind === "entity" ? t("onCharacter", { name: link.label }) : link.label}
						</span>
					</Link>
				) : (
					<span className="truncate">{item.reference}</span>
				)}
				{bibleName && <span className="shrink-0 rounded bg-muted px-1.5 py-0.5">{bibleName}</span>}
				<time className="ml-auto shrink-0" dateTime={new Date(item.createdAt).toISOString()}>
					{relativeAge(item.createdAt)}
				</time>
			</div>

			<ContributionItem contribution={item} linkMap={linkMap} />

			{/* Only the roots beyond the preview are missing; the rest of the tree
			    lives in the reader, where there is room for it. */}
			{hidden > 0 && link && (
				<Link
					href={link.href}
					className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
				>
					<MessagesSquare className="h-3 w-3" />
					{t("viewAllComments", { count: item.totalComments })}
				</Link>
			)}
		</Card>
	);
}
