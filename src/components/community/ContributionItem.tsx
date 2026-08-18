"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import type { ContributionFull } from "@/app/common/community/model/Community";
import { commentCreateSS } from "@/app/common/community/service/server/commentCreateSS";
import { communityFlagSS } from "@/app/common/community/service/server/communityFlagSS";
import { CitationLinks, type RefLinkMap } from "@/components/entity/CitationLinks";
import { VoteButtons } from "./VoteButtons";
import { CommentThread } from "./CommentThread";
import { useCommunity } from "./CommunityContext";

const KIND_LABEL: Record<string, string> = { fact: "Fact", analysis: "Analysis", correction: "Correction" };

export function ContributionItem({
	contribution,
	linkMap,
}: {
	contribution: ContributionFull;
	linkMap: RefLinkMap;
}) {
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
			setText("");
			setCommenting(false);
			toast.success("Comment posted");
			onChanged();
		} else {
			toast.error("Could not post comment");
		}
	};

	const flag = async () => {
		if (!requirePremium()) return;
		const res = await communityFlagSS("contribution", contribution.id);
		if (res.ok) toast.success("Thanks — we'll review this.");
		else toast.error("Could not report");
	};

	if (!show) {
		return (
			<button className="text-xs text-muted-foreground hover:underline py-2" onClick={() => setShow(true)}>
				Contribution hidden by community — show
			</button>
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
					<span className="text-[10px] uppercase tracking-wide rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
						{KIND_LABEL[contribution.kind] ?? contribution.kind}
					</span>
					<span className="text-xs text-muted-foreground">by {contribution.author.name}</span>
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
						Comment
					</button>
					<button
						className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
						onClick={flag}
					>
						<Flag className="h-3 w-3" /> Report
					</button>
				</div>
				{commenting && (
					<div className="mt-2 space-y-2">
						<textarea
							value={text}
							onChange={(e) => setText(e.target.value)}
							rows={2}
							className="w-full rounded border bg-background p-2 text-sm"
							placeholder="Add a comment…"
						/>
						<div className="flex gap-2">
							<Button size="sm" onClick={submitComment} disabled={busy}>
								Comment
							</Button>
							<Button size="sm" variant="ghost" onClick={() => setCommenting(false)}>
								Cancel
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
