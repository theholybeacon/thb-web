"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { useOptionalChapterCompletion } from "@/components/reader/progress/ChapterCompletionContext";
import type { CompletionMode } from "@/app/common/completion/model/Completion";
import { cn } from "@/lib/utils";

const MODE_LABEL_KEY: Record<CompletionMode, string> = {
	read: "modeRead",
	listen: "modeListen",
	type: "modeType",
	manual: "modeManual",
};

/**
 * This chapter's place in the user's journey, inside the reader.
 *
 * Progress is only motivating if it is visible where the reading happens —
 * making someone navigate to a stats page to discover a chapter counted defeats
 * the point. Kept to this chapter: the full picture lives at /journey.
 */
export function ProgressSection() {
	const t = useTranslations("journey");
	const completion = useOptionalChapterCompletion();

	if (!completion || !completion.loaded) return null;

	const { isComplete, completedModes, times, markComplete } = completion;

	return (
		<div className="space-y-3 px-3 pb-3">
			<div className="flex items-center gap-2">
				<span
					className={cn(
						"h-2.5 w-2.5 shrink-0 rounded-full",
						isComplete ? "bg-primary" : "bg-muted-foreground/30",
					)}
				/>
				<p className="text-sm">
					{isComplete
						? times > 1
							? t("chapterCompleteTimes", { count: times })
							: t("chapterComplete")
						: t("markCompleteHint")}
				</p>
			</div>

			{completedModes.length > 0 && (
				<div className="flex flex-wrap gap-1.5">
					{completedModes.map((mode) => (
						<span
							key={mode}
							className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
						>
							{t(MODE_LABEL_KEY[mode] as never)}
						</span>
					))}
				</div>
			)}

			{!isComplete && (
				<button
					type="button"
					onClick={() => markComplete("manual")}
					className="w-full rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
				>
					{t("markComplete")}
				</button>
			)}

			<Link
				href="/journey"
				className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
			>
				{t("title")}
				<ArrowRight className="h-3 w-3" />
			</Link>
		</div>
	);
}
