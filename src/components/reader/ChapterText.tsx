"use client";

import type { ReactNode } from "react";
import type { ChapterBlock } from "@/app/common/verse/model/verseLayout";
import type { EntityLite } from "@/app/common/entity/model/Entity";
import { renderVerseContent } from "@/components/entity/VerseText";
import { cn } from "@/lib/utils";

/**
 * Shared metrics for the verse number. Deliberately not a `<sup>`: the UA style
 * for `sup` inflates the line box it sits in, which in flowing text — where a
 * number lands every line or two — shows up as uneven leading.
 */
export const VERSE_NUMBER_CLASS =
	"select-none align-super text-[0.62em] font-medium leading-none tabular-nums mr-[0.18em]";

export function VerseNumber({ verseNumber }: { verseNumber: number }) {
	return (
		<span data-verse-number="" className={cn(VERSE_NUMBER_CLASS, "text-muted-foreground/70")}>
			{verseNumber}
		</span>
	);
}

export interface ChapterTextProps {
	blocks: ChapterBlock[];
	/** People mentioned in each verse, for inline character links. */
	mentionsByVerse?: Record<number, EntityLite[]>;
	/** Per-verse text treatment: range dimming (Read), active/past (Listen). */
	verseClassName?: (verseNumber: number) => string | undefined;
	/** Replaces the default number. Read passes a note button. */
	renderVerseNumber?: (verseNumber: number) => ReactNode;
	/** Listen: click-to-seek. */
	onVerseClick?: (verseNumber: number) => void;
	/** Receives the zero-size anchor that carries `id="verse-N"`. */
	registerVerseAnchor?: (verseNumber: number, el: HTMLElement | null) => void;
	className?: string;
}

/**
 * Renders a chapter as flowing, book-like text: verses run together into
 * paragraphs and only break where the source says to.
 *
 * Shared by Read and Listen so the two surfaces stay identical — and so Listen
 * finally gets the character links and `#verse-N` anchors it never had. Type
 * mode uses the same parser and CSS but renders per-character, so it builds its
 * own tree.
 */
export function ChapterText({
	blocks,
	mentionsByVerse,
	verseClassName,
	renderVerseNumber,
	onVerseClick,
	registerVerseAnchor,
	className,
}: ChapterTextProps) {
	return (
		<div className={cn("bible-text", className)}>
			{blocks.map((block, blockIndex) => (
				<p
					key={blockIndex}
					className={cn("bible-block", block.kind === "poetry" ? "bible-block-poetry" : "bible-block-prose")}
				>
					{block.lines.map((line, lineIndex) => (
						<span key={lineIndex} className="bible-line" data-level={line.level}>
							{line.parts.map((part, partIndex) => (
								<span
									key={`${part.verseNumber}-${partIndex}`}
									/*
									 * `data-verse` lets a text selection be resolved back to its verse by
									 * walking up from the Range's container — the zero-size `#verse-N`
									 * anchor below cannot serve that purpose, since it holds no text.
									 */
									data-verse={part.verseNumber}
									className={cn(
										"transition-colors",
										onVerseClick && "cursor-pointer",
										verseClassName?.(part.verseNumber),
									)}
									onClick={onVerseClick ? () => onVerseClick(part.verseNumber) : undefined}
								>
									{partIndex > 0 && " "}
									{part.isVerseStart && (
										<>
											{/*
											 * The anchor is a zero-size inline-BLOCK, not a bare inline:
											 * an atomic inline has a real margin box, so `scroll-mt` still
											 * applies when the browser jumps to `#verse-N`.
											 */}
											<span
												id={`verse-${part.verseNumber}`}
												ref={(el) => {
													registerVerseAnchor?.(part.verseNumber, el);
												}}
												className="inline-block h-0 w-0 scroll-mt-24 align-baseline"
												aria-hidden="true"
											/>
											{renderVerseNumber ? (
												renderVerseNumber(part.verseNumber)
											) : (
												<VerseNumber verseNumber={part.verseNumber} />
											)}
										</>
									)}
									{/*
									 * Scripture text only — deliberately excludes the verse number and any
									 * caller-supplied chrome, so reconstructing a verse for word-occurrence
									 * counting never picks up "16" from the number or a note button's label.
									 * The number carries `data-verse-number` for the other half of that job:
									 * stripping it back out of a DOM selection that swallowed it.
									 */}
									<span data-verse-text="">
										{renderVerseContent(part.text, mentionsByVerse?.[part.verseNumber])}
									</span>
								</span>
							))}
						</span>
					))}
				</p>
			))}
		</div>
	);
}
