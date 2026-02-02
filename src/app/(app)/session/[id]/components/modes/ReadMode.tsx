"use client";

import { useTranslations } from "next-intl";
import { Verse } from "@/app/common/verse/model/Verse";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReadModeProps {
	verses: Verse[];
	startVerse?: number | null;
	endVerse?: number | null;
	bookName?: string;
	chapterNumber?: number;
	isLastChapter?: boolean;
	showCompletion?: boolean;
	onComplete?: () => void;
}

export function ReadMode({ verses, startVerse, endVerse, bookName, chapterNumber, isLastChapter = true, showCompletion = true, onComplete }: ReadModeProps) {
	const t = useTranslations();

	const reference = bookName && chapterNumber
		? `${bookName} ${chapterNumber}${startVerse ? `:${startVerse}${endVerse && endVerse !== startVerse ? `-${endVerse}` : ""}` : ""}`
		: null;

	return (
		<div className="space-y-6">
			{reference && (
				<div className="pb-4 border-b">
					<h2 className="text-2xl md:text-3xl font-serif font-semibold text-center">
						{reference}
					</h2>
				</div>
			)}

			{verses.length > 0 ? (
				<div className="space-y-4">
					{verses.map((verse) => {
						const hasVerseRange = startVerse != null;
						const startV = startVerse ?? 1;
						const endV = endVerse ?? startV;
						const isHighlighted = !hasVerseRange || (verse.verseNumber >= startV && verse.verseNumber <= endV);

						return (
							<p
								key={verse.id}
								className={cn(
									"leading-relaxed text-base md:text-lg transition-opacity",
									!isHighlighted && "opacity-30"
								)}
							>
								<sup
									className={cn(
										"text-xs font-semibold mr-1.5 select-none",
										isHighlighted ? "text-primary" : "text-muted-foreground"
									)}
								>
									{verse.verseNumber}
								</sup>
								<span className={isHighlighted ? "text-foreground" : "text-muted-foreground"}>
									{verse.content}
								</span>
							</p>
						);
					})}
				</div>
			) : (
				<div className="text-center py-12">
					<BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
					<p className="text-muted-foreground">{t("session.noContent")}</p>
				</div>
			)}

			{showCompletion && onComplete && (
				<div className="flex justify-center pt-4">
					<Button onClick={onComplete} size="lg">
						{isLastChapter ? (
							<>
								<CheckCircle2 className="h-4 w-4 mr-2" />
								{t("session.markAsRead")}
							</>
						) : (
							<>
								{t("session.nextChapter")}
								<ChevronRight className="h-4 w-4 ml-2" />
							</>
						)}
					</Button>
				</div>
			)}
		</div>
	);
}
