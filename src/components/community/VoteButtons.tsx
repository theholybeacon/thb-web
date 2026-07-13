"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { communityVoteSS } from "@/app/common/community/service/server/communityVoteSS";
import type { VoteTargetType } from "@/app/common/community/model/Community";
import { useCommunity } from "./CommunityContext";

/** Up/down vote control with optimistic update; premium-gated. */
export function VoteButtons({
	targetType,
	targetId,
	initialScore,
	initialUserVote,
}: {
	targetType: VoteTargetType;
	targetId: string;
	initialScore: number;
	initialUserVote: number;
}) {
	const { requirePremium } = useCommunity();
	const [score, setScore] = useState(initialScore);
	const [vote, setVote] = useState(initialUserVote);
	const [busy, setBusy] = useState(false);

	const cast = async (dir: 1 | -1) => {
		if (!requirePremium() || busy) return;
		const next = vote === dir ? 0 : dir; // clicking the active arrow clears the vote
		const prevScore = score;
		const prevVote = vote;
		setScore(score - vote + next);
		setVote(next);
		setBusy(true);
		try {
			const res = await communityVoteSS(targetType, targetId, next);
			if (res.ok && typeof res.score === "number") {
				setScore(res.score);
				setVote(res.userVote ?? next);
			} else {
				setScore(prevScore);
				setVote(prevVote);
			}
		} catch {
			setScore(prevScore);
			setVote(prevVote);
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className="flex flex-col items-center shrink-0 select-none">
			<button
				type="button"
				aria-label="Upvote"
				onClick={() => cast(1)}
				className={cn("hover:text-primary", vote === 1 ? "text-primary" : "text-muted-foreground")}
			>
				<ChevronUp className="h-4 w-4" />
			</button>
			<span className="text-xs font-medium tabular-nums">{score}</span>
			<button
				type="button"
				aria-label="Downvote"
				onClick={() => cast(-1)}
				className={cn("hover:text-primary", vote === -1 ? "text-primary" : "text-muted-foreground")}
			>
				<ChevronDown className="h-4 w-4" />
			</button>
		</div>
	);
}
