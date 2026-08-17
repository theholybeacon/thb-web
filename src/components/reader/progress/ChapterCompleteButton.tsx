"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@clerk/nextjs";
import { Check, CircleCheckBig } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useOptionalChapterCompletion } from "./ChapterCompletionContext";

/**
 * The chapter's completion state, and the way to declare it by hand.
 *
 * Auto-detection covers the common cases, but it cannot know that someone read
 * this chapter in a paper Bible, or followed along while a passage was read
 * aloud. Leaving the user no way to say so would make the whole progress picture
 * feel wrong to exactly the people most invested in it — so the manual mark is
 * always available, not a fallback for when detection fails.
 *
 * Renders nothing for anonymous readers: there is nowhere to record it.
 */
export function ChapterCompleteButton() {
	const t = useTranslations("journey");
	const completion = useOptionalChapterCompletion();
	const { isSignedIn } = useAuth();

	if (!completion || !isSignedIn || !completion.loaded) return null;

	const { isComplete, times, markComplete } = completion;

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className={cn("h-8 px-2", isComplete && "text-primary")}
					onClick={() => markComplete("manual")}
					disabled={isComplete}
					aria-label={isComplete ? t("chapterComplete") : t("markComplete")}
				>
					{isComplete ? (
						<CircleCheckBig className="h-4 w-4 sm:mr-1.5" />
					) : (
						<Check className="h-4 w-4 sm:mr-1.5" />
					)}
					<span className="hidden sm:inline">
						{isComplete ? t("chapterComplete") : t("markComplete")}
					</span>
					{times > 1 && (
						<span className="ml-1.5 rounded-full bg-primary/15 px-1.5 text-xs font-medium text-primary">
							{times}
						</span>
					)}
				</Button>
			</TooltipTrigger>
			<TooltipContent>
				{isComplete
					? times > 1
						? t("chapterCompleteTimes", { count: times })
						: t("chapterComplete")
					: t("markCompleteHint")}
			</TooltipContent>
		</Tooltip>
	);
}
