"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { AiContent } from "@/components/entity/AiContent";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StepExplanationBannerProps {
	/** The study step's AI explanation. Absent on the public reader. */
	explanation?: string | null;
}

/**
 * The study step's AI insight, pinned above the reader's scroll container.
 *
 * It used to be the first child of the scrolling text in each reading mode,
 * which meant it slid out of view the moment you started reading — precisely
 * when the guidance is worth having. Rendering it as a sibling *above* the
 * scroller (rather than `sticky` inside it) keeps the verse-anchor offset in
 * `scrollToVerse.ts` valid, since the scroll port itself never gains chrome.
 */
export function StepExplanationBanner({ explanation }: StepExplanationBannerProps) {
	const t = useTranslations();
	const [expanded, setExpanded] = useState(true);

	// On a phone the insight starts folded to one line: open, it can take a third
	// of the screen from the text it is about. After mount, so the server render
	// and the first client render agree.
	useEffect(() => {
		if (window.matchMedia("(max-width: 767px)").matches) setExpanded(false);
	}, []);

	if (!explanation) return null;

	const label = expanded ? t("reader.explanation.collapse") : t("reader.explanation.expand");

	return (
		<div className="thb-keyboard-hide mx-auto w-full max-w-4xl px-2 pt-1.5 sm:px-4 sm:pt-3 md:px-6">
			<AiContent>
				<div className="flex min-w-0 flex-1 items-start gap-2">
					<p
						className={cn(
							"min-w-0 flex-1 text-sm leading-relaxed italic text-muted-foreground",
							!expanded && "line-clamp-1",
						)}
					>
						{explanation}
					</p>
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7 shrink-0"
						onClick={() => setExpanded((open) => !open)}
						aria-expanded={expanded}
						title={label}
						aria-label={label}
					>
						{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
					</Button>
				</div>
			</AiContent>
		</div>
	);
}
