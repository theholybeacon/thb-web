"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import { track } from "@/lib/analytics";
import type { ContributionFull } from "@/app/common/community/model/Community";
import { commentCreateSS } from "@/app/common/community/service/server/commentCreateSS";
import { communityFlagSS } from "@/app/common/community/service/server/communityFlagSS";
import { CitationLinks, type RefLinkMap } from "@/components/entity/CitationLinks";
import { VoteButtons } from "./VoteButtons";
import { CommentThread } from "./CommentThread";
import { DeleteAction } from "./DeleteAction";
import { useCommunity } from "./CommunityContext";

/**
 * Deliberately has no entry for "comment" — the default kind. Classifying a post
 * is opt-in, and an unclassified one shows the author's name and nothing else.
 */
const LABELLED_KINDS = new Set(["fact", "analysis", "correction"]);

export function ContributionItem({
	contribution,
	linkMap,
}: {
	contribution: ContributionFull;
	linkMap: RefLinkMap;
}) {
	const t = useTranslations("community");
	const tCommon = useTranslations("common");
	const { requirePremium, onChanged } = useCommunity();
	const [show, setShow] = useState(contribution.score > -3);
	const [commenting, setCommenting] = useState(false);
	const [text, setText] = useState("");
	const [busy, setBusy] = useState(false);

	const submitComment = async () => {
		if (!requirePremium() || !text.trim() || busy) return;
		setBusy(true);
		const res = await commentCreateSS({ contributionId: contribution.id, body: text });
		setBusy(false);
		if (res.ok) {
			track("comment_posted", { isReply: false });
			setText("");
			setCommenting(false);
			toast.success(t("commentPosted"));
			onChanged();
		} else {
			toast.error(t("commentFailed"));
		}
	};

	const flag = async () => {
		if (!requirePremium()) return;
		const res = await communityFlagSS("contribution", contribution.id);
		if (res.ok) {
			track("community_flagged", { targetType: "contribution" });
			toast.success(t("reported"));
		} else toast.error(t("reportFailed"));
	};

	if (!show) {
		return (
			<button className="text-xs text-muted-foreground hover:underline py-2" onClick={() => setShow(true)}>
				{t("contributionHidden")}
			</button>
		);
	}

	// Deleted by its author, but comments below survived — kept as a placeholder
	// so the discussion under it is not lost. See hydrateContributions.
	if (contribution.deleted) {
		return (
			<div className="py-3 border-t first:border-t-0">
				<p className="text-sm italic text-muted-foreground">{t("deleted")}</p>
				{contribution.comments.length > 0 && (
					<div className="mt-2">
						<CommentThread contributionId={contribution.id} comments={contribution.comments} />
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="flex gap-2 py-3 border-t first:border-t-0">
			<VoteButtons
				targetType="contribution"
				targetId={contribution.id}
				initialScore={contribution.score}
				initialUserVote={contribution.userVote}
			/>
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 mb-1">
					{LABELLED_KINDS.has(contribution.kind) && (
						<span className="text-[10px] uppercase tracking-wide rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
							{t(`kind.${contribution.kind}` as "kind.fact")}
						</span>
					)}
					<span className="text-xs font-medium text-foreground">{contribution.author.name}</span>
				</div>
				<p className="text-sm text-foreground whitespace-pre-wrap">
					{contribution.body}
					<CitationLinks refs={contribution.citations} linkMap={linkMap} />
				</p>
				<div className="flex items-center gap-3 mt-2">
					<button
						className="text-xs text-muted-foreground hover:text-primary"
						onClick={() => {
							if (requirePremium()) setCommenting((v) => !v);
						}}
					>
						{t("comment")}
					</button>
					<button
						className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
						onClick={flag}
					>
						<Flag className="h-3 w-3" /> {t("report")}
					</button>
					{contribution.isMine && <DeleteAction targetType="contribution" id={contribution.id} />}
				</div>
				{commenting && (
					<div className="mt-2 space-y-2">
						<textarea
							value={text}
							onChange={(e) => setText(e.target.value)}
							rows={2}
							className="w-full rounded border bg-background p-2 text-sm"
							placeholder={t("commentPlaceholder")}
						/>
						<div className="flex gap-2">
							<Button size="sm" onClick={submitComment} disabled={busy}>
								{t("comment")}
							</Button>
							<Button size="sm" variant="ghost" onClick={() => setCommenting(false)}>
								{tCommon("cancel")}
							</Button>
						</div>
					</div>
				)}
				{contribution.comments.length > 0 && (
					<div className="mt-2">
						<CommentThread contributionId={contribution.id} comments={contribution.comments} />
					</div>
				)}
			</div>
		</div>
	);
}
