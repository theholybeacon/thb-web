"use client";

import { useEffect, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Verse } from "@/app/common/verse/model/Verse";
import { EntityLite } from "@/app/common/entity/model/Entity";
import { renderVerseContent } from "@/components/entity/VerseText";
import { CharacterName } from "@/components/entity/CharacterName";
import { AiContent } from "@/components/entity/AiContent";
import { useOptionalSessionProgress } from "../../context/SessionProgressContext";
import { BookOpen, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReadModeProps {
	verses: Verse[];
	startVerse?: number | null;
	endVerse?: number | null;
	bookName?: string;
	chapterNumber?: number;
	explanation?: string | null;
	/** People mentioned in this chapter (for inline links + the people list). */
	people?: EntityLite[];
	mentionsByVerse?: Record<number, EntityLite[]>;
	/** When true, character names link to their page; otherwise they're locked. */
	charactersInteractive?: boolean;
	/** Invoked when a non-premium user clicks a locked character name. */
	onLockedCharacterClick?: () => void;
}

export function ReadMode({ verses, startVerse, endVerse, bookName, chapterNumber, explanation, people, mentionsByVerse, charactersInteractive = true, onLockedCharacterClick }: ReadModeProps) {
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
				<AiContent>
					<p className="text-sm leading-relaxed italic text-muted-foreground">{explanation}</p>
				</AiContent>
			)}

			{reference && (
				<div className="pb-4 border-b">
					<h2 className="text-2xl md:text-3xl font-serif font-semibold text-center">
						{reference}
					</h2>
				</div>
			)}

			{people && people.length > 0 && (
				<div className="rounded-lg border bg-card/50 p-3">
					<div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
						<Users className="h-4 w-4" />
						People in this chapter
					</div>
					<div className="flex flex-wrap gap-2">
						{people.map((p) => (
							<CharacterName
								key={p.id}
								slug={p.slug}
								variant="chip"
								interactive={charactersInteractive}
								onLockedClick={onLockedCharacterClick}
							>
								{p.name}
							</CharacterName>
						))}
					</div>
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
									{renderVerseContent(verse.content, mentionsByVerse?.[verse.verseNumber], {
										interactive: charactersInteractive,
										onLockedClick: onLockedCharacterClick,
									})}
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
