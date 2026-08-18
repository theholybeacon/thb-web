"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { communityDeleteSS } from "@/app/common/community/service/server/communityDeleteSS";
import type { VoteTargetType } from "@/app/common/community/model/Community";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCommunity } from "./CommunityContext";

/**
 * "Delete" for a post you wrote, with the same confirm-then-refresh shape as
 * NotesSection. Shared by ContributionItem and CommentThread so the dialog is
 * wired once; the caller decides whether to render it at all (`isMine`).
 */
export function DeleteAction({ targetType, id }: { targetType: VoteTargetType; id: string }) {
	const { onChanged } = useCommunity();
	const [confirming, setConfirming] = useState(false);
	const [deleting, setDeleting] = useState(false);

	const noun = targetType === "contribution" ? "post" : "comment";

	const remove = async () => {
		setDeleting(true);
		const res = await communityDeleteSS(targetType, id);
		setDeleting(false);
		if (res.ok) {
			setConfirming(false);
			toast.success("Deleted");
			onChanged();
		} else {
			toast.error("Could not delete");
		}
	};

	return (
		<>
			<button
				className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1"
				onClick={() => setConfirming(true)}
			>
				<Trash2 className="h-3 w-3" /> Delete
			</button>
			<AlertDialog open={confirming} onOpenChange={(o) => !o && setConfirming(false)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete this {noun}?</AlertDialogTitle>
						<AlertDialogDescription>
							This cannot be undone. Replies underneath it will stay visible.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive hover:bg-destructive/90"
							disabled={deleting}
							onClick={(e) => {
								// Keep the dialog up while the action runs; `remove` closes it.
								e.preventDefault();
								void remove();
							}}
						>
							{deleting ? "Deleting…" : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
