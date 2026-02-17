"use client";

import { useEffect, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Verse } from "@/app/common/verse/model/Verse";
import { useOptionalSessionProgress } from "../../context/SessionProgressContext";
import { BookOpen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReadModeProps {
	verses: Verse[];
	startVerse?: number | null;
	endVerse?: number | null;
	bookName?: string;
	chapterNumber?: number;
	explanation?: string | null;
}

export function ReadMode({ verses, startVerse, endVerse, bookName, chapterNumber, explanation }: ReadModeProps) {
	const t = useTranslations();
	const progress = useOptionalSessionProgress();
	const firstVerseRef = useRef<HTMLParagraphElement>(null);

	const sortedVerses = useMemo(
		() => [...verses].sort((a, b) => a.verseNumber - b.verseNumber),
		[verses]
	);

	const reference = bookName && chapterNumber
		? `${bookName} ${chapterNumber}${startVerse ? `:${startVerse}${endVerse && endVerse !== startVerse ? `-${endVerse}` : ""}` : ""}`
		: null;

	// Report mode progress to context (read mode has no linear progress)
	useEffect(() => {
		progress?.reportModeProgress(0, 1, false);
	}, [progress]);

	// Auto-scroll to the first relevant verse
	useEffect(() => {
		if (firstVerseRef.current) {
			const timeout = setTimeout(() => {
				firstVerseRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
			}, 100);
			return () => clearTimeout(timeout);
		}
	}, [startVerse, endVerse]);

	return (
		<div className="space-y-6">
			{explanation && (
				<div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
					<div className="flex items-start gap-2">
						<Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
						<p className="text-sm leading-relaxed italic text-muted-foreground">{explanation}</p>
					</div>
				</div>
			)}

			{reference && (
				<div className="pb-4 border-b">
					<h2 className="text-2xl md:text-3xl font-serif font-semibold text-center">
						{reference}
					</h2>
				</div>
			)}

			{sortedVerses.length > 0 ? (
				<div className="space-y-4">
					{sortedVerses.map((verse) => {
						const hasVerseRange = startVerse != null;
						const startV = startVerse ?? 1;
						const endV = endVerse ?? startV;
						const isHighlighted = !hasVerseRange || (verse.verseNumber >= startV && verse.verseNumber <= endV);
						const isFirstRelevant = verse.verseNumber === (startVerse ?? 1);

						return (
							<p
								key={verse.id}
								ref={isFirstRelevant ? firstVerseRef : undefined}
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
		</div>
	);
}
