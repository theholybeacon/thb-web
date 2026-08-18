"use client";

import { useEffect, useRef, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Verse } from "@/app/common/verse/model/Verse";
import { EntityLite } from "@/app/common/entity/model/Entity";
import { parseChapterBlocks } from "@/app/common/verse/model/verseLayout";
import { ChapterText, VERSE_NUMBER_CLASS } from "@/components/reader/ChapterText";
import { scrollVerseAnchorToTop } from "@/components/reader/scrollToVerse";
import { rangeIncludes, toVerseRange, VERSE_HIGHLIGHT_CLASS, type VerseRange } from "@/components/reader/verseHighlight";
import { useOptionalSessionProgress } from "../../context/SessionProgressContext";
import { useReadCompletion } from "@/components/reader/progress/useReadCompletion";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReadModeProps {
	verses: Verse[];
	startVerse?: number | null;
	endVerse?: number | null;
	bookName?: string;
	chapterNumber?: number;
	/** People mentioned in each verse, for inline character links. */
	mentionsByVerse?: Record<number, EntityLite[]>;
	/** How many notes each verse already has, keyed by verse number. */
	noteCountsByVerseNumber?: Record<number, number>;
	/** Enables the per-verse note affordance when provided. */
	onVerseNoteClick?: (verse: Verse) => void;
	/**
	 * Verses to mark in place — a short step passage or a `#verse-N` deep link.
	 * Resolved by ReaderEngine, which owns the highlight-vs-dim decision.
	 */
	highlightRange?: VerseRange | null;
	/** Greys out everything outside `startVerse`..`endVerse`. Long passages only. */
	dimOutsideRange?: boolean;
	/** The reader's scroll container, owned by ReaderEngine. */
	scrollerRef?: React.RefObject<HTMLDivElement | null>;
}

export function ReadMode({ verses, startVerse, endVerse, bookName, chapterNumber, mentionsByVerse, noteCountsByVerseNumber, onVerseNoteClick, highlightRange, dimOutsideRange = false, scrollerRef }: ReadModeProps) {
	const t = useTranslations();
	const progress = useOptionalSessionProgress();
	const anchorsRef = useRef<Record<number, HTMLElement | null>>({});
	const endSentinelRef = useRef<HTMLDivElement>(null);

	const blocks = useMemo(() => parseChapterBlocks(verses), [verses]);
	const verseCount = verses.length;

	// Reading has no natural completion event, so it is inferred from reaching
	// the end plus a length-scaled dwell. See useReadCompletion.
	useReadCompletion(endSentinelRef, verseCount, verseCount > 0);

	const reference = bookName && chapterNumber
		? `${bookName} ${chapterNumber}${startVerse ? `:${startVerse}${endVerse && endVerse !== startVerse ? `-${endVerse}` : ""}` : ""}`
		: null;

	// Report mode progress to context (read mode has no linear progress)
	useEffect(() => {
		progress?.reportModeProgress(0, 1, false);
	}, [progress]);

	const passageRange = useMemo(() => toVerseRange(startVerse, endVerse), [startVerse, endVerse]);

	// Auto-scroll to the first relevant verse. A highlight wins over the step's
	// own start: when both exist the highlight is the more specific target, and
	// with neither this scrolls the column back to the top on a chapter change.
	const scrollTarget = highlightRange?.start ?? startVerse ?? 1;
	useEffect(() => {
		const timeout = setTimeout(() => {
			scrollVerseAnchorToTop(scrollerRef?.current ?? null, anchorsRef.current[scrollTarget] ?? null);
		}, 100);
		return () => clearTimeout(timeout);
	}, [scrollTarget, blocks, scrollerRef]);

	const isDimmed = useCallback(
		(verseNumber: number) => dimOutsideRange && !rangeIncludes(passageRange, verseNumber),
		[dimOutsideRange, passageRange],
	);

	/*
	 * Out-of-range verses are dimmed by COLOUR, not opacity. Opacity on an inline
	 * span opens a stacking context per verse and multiplies with the character
	 * links inside it, which turns them muddy; colour composes cleanly.
	 *
	 * Highlighting is the other half of the same job — see verseHighlight.ts for
	 * which of the two a given passage gets.
	 */
	const verseClassName = useCallback(
		(verseNumber: number) => {
			if (rangeIncludes(highlightRange ?? null, verseNumber)) return VERSE_HIGHLIGHT_CLASS;
			return isDimmed(verseNumber) ? "text-muted-foreground/50" : "text-foreground";
		},
		[highlightRange, isDimmed],
	);

	/*
	 * The note affordance is the verse number itself. A hover-revealed icon after
	 * every verse worked when each verse was its own block, but mid-paragraph it
	 * reflows the rest of the paragraph on every hover. The count deliberately
	 * lives in the tooltip rather than beside the number, for the same reason.
	 */
	const renderVerseNumber = useCallback(
		(verseNumber: number) => {
			const noteCount = noteCountsByVerseNumber?.[verseNumber] ?? 0;
			const dimmed = isDimmed(verseNumber);
			if (!onVerseNoteClick) {
				return (
					<span className={cn(VERSE_NUMBER_CLASS, dimmed ? "text-muted-foreground/40" : "text-muted-foreground/70")}>
						{verseNumber}
					</span>
				);
			}
			const verse = verses.find((v) => v.verseNumber === verseNumber);
			const label = noteCount > 0 ? t("notes.viewVerseNotes") : t("notes.addVerseNote");
			return (
				<button
					type="button"
					onClick={() => verse && onVerseNoteClick(verse)}
					title={label}
					aria-label={label}
					className={cn(
						VERSE_NUMBER_CLASS,
						"rounded-[2px] transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
						noteCount > 0
							? "text-foreground underline decoration-dotted underline-offset-[3px]"
							: dimmed
								? "text-muted-foreground/40"
								: "text-muted-foreground/70",
					)}
				>
					{verseNumber}
				</button>
			);
		},
		[noteCountsByVerseNumber, onVerseNoteClick, verses, isDimmed, t],
	);

	return (
		<div className="space-y-6">
			{reference && (
				<div className="pb-4 border-b">
					<h2 className="text-2xl md:text-3xl font-serif font-semibold text-center">
						{reference}
					</h2>
				</div>
			)}

			{blocks.length > 0 ? (
				<>
					<ChapterText
						blocks={blocks}
						mentionsByVerse={mentionsByVerse}
						verseClassName={verseClassName}
						renderVerseNumber={renderVerseNumber}
						registerVerseAnchor={(verseNumber, el) => {
							anchorsRef.current[verseNumber] = el;
						}}
					/>
					{/*
					 * Bottom-of-chapter sentinel. Flowing text has no "last verse" box to
					 * observe, and observing the final paragraph instead would mark a
					 * chapter read as soon as its top edge appeared.
					 */}
					<div ref={endSentinelRef} aria-hidden="true" className="h-px w-full" />
				</>
			) : (
				<div className="text-center py-12">
					<BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
					<p className="text-muted-foreground">{t("session.noContent")}</p>
				</div>
			)}
		</div>
	);
}
