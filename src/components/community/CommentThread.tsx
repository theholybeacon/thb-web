"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import type { CommentNode } from "@/app/common/community/model/Community";
import { commentCreateSS } from "@/app/common/community/service/server/commentCreateSS";
import { VoteButtons } from "./VoteButtons";
import { DeleteAction } from "./DeleteAction";
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
	const { requirePremium, onChanged } = useCommunity();
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
			onChanged();
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

	// The author deleted it, but replies below survived — the node is kept only
	// so those replies keep their place in the thread. Nothing is actionable.
	if (comment.deleted) {
		return (
			<div className="py-2">
				<p className="text-sm italic text-muted-foreground">[deleted]</p>
				{comment.replies.length > 0 && (
					<CommentThread contributionId={contributionId} comments={comment.replies} depth={depth + 1} />
				)}
			</div>
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
					<div className="flex items-center gap-3 mt-1">
						<button
							className="text-xs text-muted-foreground hover:text-primary"
							onClick={() => {
								if (requirePremium()) setReplying((v) => !v);
							}}
						>
							Reply
						</button>
						{comment.isMine && <DeleteAction targetType="comment" id={comment.id} />}
					</div>
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
