"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import type { CommentNode } from "@/app/common/community/model/Community";
import { commentCreateSS } from "@/app/common/community/service/server/commentCreateSS";
import { VoteButtons } from "./VoteButtons";
import { useCommunity } from "./CommunityContext";

/** Recursively renders a fully-nested comment tree. */
export function CommentThread({
	contributionId,
	comments,
	depth = 0,
}: {
	contributionId: string;
	comments: CommentNode[];
	depth?: number;
}) {
	return (
		<div className={depth > 0 ? "ml-3 border-l pl-3" : ""}>
			{comments.map((c) => (
				<CommentItem key={c.id} contributionId={contributionId} comment={c} depth={depth} />
			))}
		</div>
	);
}

function CommentItem({
	contributionId,
	comment,
	depth,
}: {
	contributionId: string;
	comment: CommentNode;
	depth: number;
}) {
	const { requirePremium } = useCommunity();
	const router = useRouter();
	const [replying, setReplying] = useState(false);
	const [text, setText] = useState("");
	const [busy, setBusy] = useState(false);
	const [show, setShow] = useState(comment.score > -3);

	const submit = async () => {
		if (!requirePremium() || !text.trim() || busy) return;
		setBusy(true);
		const res = await commentCreateSS({ contributionId, parentCommentId: comment.id, body: text });
		setBusy(false);
		if (res.ok) {
			setText("");
			setReplying(false);
			toast.success("Reply posted");
			router.refresh();
		} else {
			toast.error("Could not post reply");
		}
	};

	if (!show) {
		return (
			<button className="text-xs text-muted-foreground hover:underline py-1" onClick={() => setShow(true)}>
				Comment hidden by community — show
			</button>
		);
	}

	return (
		<div className="py-2">
			<div className="flex gap-2">
				<VoteButtons
					targetType="comment"
					targetId={comment.id}
					initialScore={comment.score}
					initialUserVote={comment.userVote}
				/>
				<div className="flex-1 min-w-0">
					<p className="text-xs text-muted-foreground">
						<span className="font-medium text-foreground">{comment.author.name}</span>
					</p>
					<p className="text-sm whitespace-pre-wrap">{comment.body}</p>
					<button
						className="text-xs text-muted-foreground hover:text-primary mt-1"
						onClick={() => {
							if (requirePremium()) setReplying((v) => !v);
						}}
					>
						Reply
					</button>
					{replying && (
						<div className="mt-2 space-y-2">
							<textarea
								value={text}
								onChange={(e) => setText(e.target.value)}
								rows={2}
								className="w-full rounded border bg-background p-2 text-sm"
								placeholder="Write a reply…"
							/>
							<div className="flex gap-2">
								<Button size="sm" onClick={submit} disabled={busy}>
									Reply
								</Button>
								<Button size="sm" variant="ghost" onClick={() => setReplying(false)}>
									Cancel
								</Button>
							</div>
						</div>
					)}
					{comment.replies.length > 0 && (
						<CommentThread contributionId={contributionId} comments={comment.replies} depth={depth + 1} />
					)}
				</div>
			</div>
		</div>
	);
}
