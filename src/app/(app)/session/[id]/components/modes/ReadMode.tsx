"use client";

import { useEffect, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Verse } from "@/app/common/verse/model/Verse";
import { EntityLite } from "@/app/common/entity/model/Entity";
import { renderVerseContent } from "@/components/entity/VerseText";
import { AiContent } from "@/components/entity/AiContent";
import { useOptionalSessionProgress } from "../../context/SessionProgressContext";
import { useReadCompletion } from "@/components/reader/progress/useReadCompletion";
import { BookOpen, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReadModeProps {
	verses: Verse[];
	startVerse?: number | null;
	endVerse?: number | null;
	bookName?: string;
	chapterNumber?: number;
	explanation?: string | null;
	/** People mentioned in each verse, for inline character links. */
	mentionsByVerse?: Record<number, EntityLite[]>;
	/** How many notes each verse already has, keyed by verse number. */
	noteCountsByVerseNumber?: Record<number, number>;
	/** Enables the per-verse note affordance when provided. */
	onVerseNoteClick?: (verse: Verse) => void;
}

export function ReadMode({ verses, startVerse, endVerse, bookName, chapterNumber, explanation, mentionsByVerse, noteCountsByVerseNumber, onVerseNoteClick }: ReadModeProps) {
	const t = useTranslations();
	const progress = useOptionalSessionProgress();
	const firstVerseRef = useRef<HTMLParagraphElement>(null);
	const lastVerseRef = useRef<HTMLParagraphElement>(null);

	const sortedVerses = useMemo(
		() => [...verses].sort((a, b) => a.verseNumber - b.verseNumber),
		[verses]
	);

	// Reading has no natural completion event, so it is inferred from reaching
	// the last verse plus a length-scaled dwell. See useReadCompletion.
	useReadCompletion(lastVerseRef, sortedVerses.length, sortedVerses.length > 0);

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

			{sortedVerses.length > 0 ? (
				<div className="space-y-4">
					{sortedVerses.map((verse, index) => {
						const hasVerseRange = startVerse != null;
						const startV = startVerse ?? 1;
						const endV = endVerse ?? startV;
						const isHighlighted = !hasVerseRange || (verse.verseNumber >= startV && verse.verseNumber <= endV);
						const isFirstRelevant = verse.verseNumber === (startVerse ?? 1);
						const isLast = index === sortedVerses.length - 1;
						const noteCount = noteCountsByVerseNumber?.[verse.verseNumber] ?? 0;

						return (
							<p
								key={verse.id}
								id={`verse-${verse.verseNumber}`}
								// A one-verse chapter is both the first relevant verse and the
								// last, so both refs have to be assignable to the same node.
								ref={(node) => {
									if (isFirstRelevant) firstVerseRef.current = node;
									if (isLast) lastVerseRef.current = node;
								}}
								className={cn(
									"group leading-relaxed text-base md:text-lg transition-opacity scroll-mt-24",
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
									{renderVerseContent(verse.content, mentionsByVerse?.[verse.verseNumber])}
								</span>
								{onVerseNoteClick && (
									<button
										type="button"
										onClick={() => onVerseNoteClick(verse)}
										title={noteCount > 0 ? t("notes.viewVerseNotes") : t("notes.addVerseNote")}
										aria-label={noteCount > 0 ? t("notes.viewVerseNotes") : t("notes.addVerseNote")}
										className={cn(
											"ml-1.5 inline-flex items-center gap-0.5 align-middle rounded px-1 py-0.5 text-xs transition-opacity hover:bg-primary/10",
											noteCount > 0
												? "text-primary opacity-100"
												: "text-muted-foreground opacity-0 focus-visible:opacity-100 group-hover:opacity-100"
										)}
									>
										<StickyNote className="h-3.5 w-3.5" />
										{noteCount > 0 && <span className="font-medium">{noteCount}</span>}
									</button>
								)}
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
