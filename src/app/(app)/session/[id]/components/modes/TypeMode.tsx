"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Verse } from "@/app/common/verse/model/Verse";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOptionalSessionProgress } from "../../context/SessionProgressContext";
import { useOptionalChapterCompletion } from "@/components/reader/progress/ChapterCompletionContext";
import { parseChapterBlocks, type ChapterBlock, type PoetryLevel } from "@/app/common/verse/model/verseLayout";
import { foldTypedChar } from "@/app/common/verse/model/typingFold";
import { VERSE_NUMBER_CLASS } from "@/components/reader/ChapterText";
import { keepVerseAnchorInBand } from "@/components/reader/scrollToVerse";

interface TypeModeProps {
	verses: Verse[];
	startVerse?: number | null;
	endVerse?: number | null;
}

interface CharState {
	/** The folded keystroke accepted here — not necessarily what is painted. */
	char: string;
	state: "pending" | "correct" | "incorrect";
}

interface TypeChar {
	/** Position in the flat charStates array. */
	index: number;
	display: string;
	expected: string;
}

interface TypeSegment {
	verseNumber: number;
	isVerseStart: boolean;
	chars: TypeChar[];
}

interface TypeLine {
	level: PoetryLevel;
	segments: TypeSegment[];
	/** The keystroke that carries the reader over a line or paragraph break. */
	breakChar?: TypeChar;
}

interface TypeBlock {
	kind: "prose" | "poetry";
	lines: TypeLine[];
}

/**
 * The only transform that changes what is PAINTED. Everything else — curly
 * quotes, dashes, accents — is handled by folding at comparison time, so the
 * typist sees the translation's real text and still gets credit for typing the
 * plain-ASCII version. The ellipsis is the exception: one glyph no keyboard
 * produces and no 1:1 fold can represent, so it has to become three dots.
 */
function typingDisplay(text: string): string {
	return text.replace(/…/g, "...").replace(/ /g, " ");
}

/**
 * Lays the chapter out for typing: the same blocks and lines the reader sees,
 * with a global index assigned to every typable character as we walk.
 *
 * Indices are assigned during the walk rather than mapped afterwards, so each
 * rendered character already knows its slot in the flat `charStates` array that
 * the cursor, stats and progress all read from.
 */
function buildTypeDocument(blocks: ChapterBlock[]): { blocks: TypeBlock[]; expected: string[] } {
	const expected: string[] = [];
	const take = (display: string): TypeChar => {
		const folded = foldTypedChar(display);
		expected.push(folded);
		return { index: expected.length - 1, display, expected: folded };
	};

	const typeBlocks: TypeBlock[] = blocks.map((block) => ({
		kind: block.kind,
		lines: block.lines.map((line) => ({
			level: line.level,
			segments: line.parts.map((part, partIndex) => ({
				verseNumber: part.verseNumber,
				isVerseStart: part.isVerseStart,
				chars: [
					...(partIndex > 0 ? [take(" ")] : []),
					...Array.from(typingDisplay(part.text), take),
				],
			})),
		})),
	}));

	// A line break is worth one keystroke, accepted from Space or Enter, so a
	// typist who instinctively hits either at the end of a line is not punished.
	// The last line of the chapter gets none — there is nothing to carry into.
	typeBlocks.forEach((block, blockIndex) => {
		block.lines.forEach((line, lineIndex) => {
			const isLast = blockIndex === typeBlocks.length - 1 && lineIndex === block.lines.length - 1;
			if (!isLast) line.breakChar = take(" ");
		});
	});

	return { blocks: typeBlocks, expected };
}

export function TypeMode({ verses, startVerse, endVerse }: TypeModeProps) {
	const t = useTranslations();
	const sessionProgress = useOptionalSessionProgress();
	const chapterCompletion = useOptionalChapterCompletion();
	const inputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// Filter verses to only those in range, sorted by verse number
	const filteredVerses = useMemo(() => {
		const filtered = verses.filter((v) => {
			if (!startVerse) return true;
			const end = endVerse ?? startVerse;
			return v.verseNumber >= startVerse && v.verseNumber <= end;
		});
		return filtered.sort((a, b) => a.verseNumber - b.verseNumber);
	}, [verses, startVerse, endVerse]);

	const document_ = useMemo(
		() => buildTypeDocument(parseChapterBlocks(filteredVerses)),
		[filteredVerses],
	);

	const [charStates, setCharStates] = useState<CharState[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [startTime, setStartTime] = useState<number | null>(null);
	const [isComplete, setIsComplete] = useState(false);
	const [stats, setStats] = useState({ accuracy: 0, wpm: 0, timeSpentSeconds: 0 });

	// Initialize char states
	useEffect(() => {
		setCharStates(document_.expected.map((char) => ({ char, state: "pending" as const })));
		setCurrentIndex(0);
		setStartTime(null);
		setIsComplete(false);
	}, [document_]);

	// Focus input on mount
	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	// Report mode progress to context
	useEffect(() => {
		sessionProgress?.reportModeProgress(currentIndex, charStates.length, isComplete);
	}, [currentIndex, charStates.length, isComplete, sessionProgress]);

	// Typing the passage through counts as finishing the chapter, on both the
	// public reader and inside a study. markComplete is idempotent per chapter.
	useEffect(() => {
		if (!isComplete) return;
		chapterCompletion?.markComplete("type", stats.timeSpentSeconds);
	}, [isComplete, stats.timeSpentSeconds, chapterCompletion]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (isComplete) return;

			// Start timer on first keypress
			if (startTime === null) {
				setStartTime(Date.now());
			}

			// Handle backspace
			if (e.key === "Backspace") {
				if (currentIndex > 0) {
					setCharStates((prev) => {
						const newStates = [...prev];
						newStates[currentIndex - 1].state = "pending";
						return newStates;
					});
					setCurrentIndex((prev) => prev - 1);
				}
				e.preventDefault();
				return;
			}

			// Enter is accepted wherever a Space is — the line breaks in poetry read
			// like somewhere you should press it.
			const typed = e.key === "Enter" ? " " : e.key;
			if (typed.length !== 1) return;

			const expectedChar = charStates[currentIndex]?.char;
			if (!expectedChar) return;

			// Lenient comparison: typing "e" satisfies "é". See typingFold.ts.
			const isCorrect = foldTypedChar(typed) === expectedChar;

			setCharStates((prev) => {
				const newStates = [...prev];
				newStates[currentIndex].state = isCorrect ? "correct" : "incorrect";
				return newStates;
			});

			const newIndex = currentIndex + 1;
			setCurrentIndex(newIndex);

			// Check if complete
			if (newIndex >= charStates.length) {
				const endTime = Date.now();
				const timeSpentSeconds = Math.round((endTime - (startTime || endTime)) / 1000);
				const correctChars = charStates.filter((c) => c.state === "correct").length + (isCorrect ? 1 : 0);
				const totalChars = charStates.length;
				const accuracy = Math.round((correctChars / totalChars) * 100);

				// WPM = (characters / 5) / minutes
				const minutes = timeSpentSeconds / 60 || 1;
				const wpm = Math.round(totalChars / 5 / minutes);

				setStats({ accuracy, wpm, timeSpentSeconds });
				setIsComplete(true);
			}

			e.preventDefault();
		},
		[charStates, currentIndex, startTime, isComplete]
	);

	const handleReset = () => {
		setCharStates(document_.expected.map((char) => ({ char, state: "pending" as const })));
		setCurrentIndex(0);
		setStartTime(null);
		setIsComplete(false);
		inputRef.current?.focus();
	};

	// Keep the cursor in view. Only when it drifts out of a comfortable band —
	// re-centring on every keystroke in a dense column is jittery.
	useEffect(() => {
		const cursor = containerRef.current?.querySelector('[data-cursor="true"]');
		keepVerseAnchorInBand(containerRef.current, cursor as HTMLElement | null);
	}, [currentIndex]);

	// Calculate current stats while typing
	const currentAccuracy =
		currentIndex > 0
			? Math.round(
					(charStates.slice(0, currentIndex).filter((c) => c.state === "correct").length / currentIndex) *
						100
				)
			: 100;

	const currentWpm =
		startTime && currentIndex > 0
			? Math.round((currentIndex / 5) / ((Date.now() - startTime) / 60000))
			: 0;

	const renderChar = (char: TypeChar, extraClassName?: string) => {
		const state = charStates[char.index]?.state ?? "pending";
		return (
			<span
				key={char.index}
				data-cursor={char.index === currentIndex ? "true" : undefined}
				className={cn(
					"transition-colors",
					state === "pending" && "text-muted-foreground/40",
					state === "correct" && "text-foreground",
					state === "incorrect" && "text-destructive bg-destructive/20 box-decoration-clone",
					// An inset shadow rather than a border: a border would add 2px to the
					// cursor character and shove the rest of the paragraph on every
					// keystroke.
					char.index === currentIndex && "shadow-[inset_2px_0_0_0_hsl(var(--primary))] animate-pulse",
					extraClassName,
				)}
			>
				{char.display}
			</span>
		);
	};

	return (
		<div className="flex flex-col gap-6 h-full">
			{/* Stats bar */}
			<div className="flex items-center justify-between px-4 py-2 bg-muted/50 rounded-lg">
				<div className="flex items-center gap-6 text-sm">
					<div>
						<span className="text-muted-foreground">{t("session.accuracy")}: </span>
						<span className={cn("font-mono font-medium", currentAccuracy < 90 ? "text-destructive" : "text-primary")}>
							{isComplete ? stats.accuracy : currentAccuracy}%
						</span>
					</div>
					<div>
						<span className="text-muted-foreground">{t("session.wpm")}: </span>
						<span className="font-mono font-medium text-primary">{isComplete ? stats.wpm : currentWpm}</span>
					</div>
					<div>
						<span className="text-muted-foreground">{t("session.progress")}: </span>
						<span className="font-mono font-medium">
							{currentIndex}/{charStates.length}
						</span>
					</div>
				</div>
				<Button variant="ghost" size="sm" onClick={handleReset}>
					<RotateCcw className="h-4 w-4 mr-2" />
					{isComplete ? t("session.tryAgain") : t("common.reset")}
				</Button>
			</div>

			{/* Typing area */}
			<div
				ref={containerRef}
				className="relative p-6 bg-card rounded-lg border flex-1 min-h-0 cursor-text overflow-y-auto"
				onClick={() => inputRef.current?.focus()}
			>
				{/* Hidden input for capturing keystrokes */}
				<input
					ref={inputRef}
					type="text"
					className="absolute opacity-0 h-0 w-0"
					onKeyDown={handleKeyDown}
					autoFocus
				/>

				{/*
				 * The same block/line structure and typography as Read and Listen, so
				 * you are copying the page you were just reading. `whitespace-pre-wrap`
				 * keeps the space characters — which are typable slots of their own —
				 * from collapsing, while still allowing lines to wrap at them.
				 */}
				<div className="bible-text whitespace-pre-wrap select-none">
					{document_.blocks.map((block, blockIndex) => (
						<p
							key={blockIndex}
							className={cn("bible-block", block.kind === "poetry" ? "bible-block-poetry" : "bible-block-prose")}
						>
							{block.lines.map((line, lineIndex) => (
								<span key={lineIndex} className="bible-line" data-level={line.level}>
									{line.segments.map((segment, segmentIndex) => (
										<span key={`${segment.verseNumber}-${segmentIndex}`}>
											{segment.isVerseStart && (
												<span className={cn(VERSE_NUMBER_CLASS, "text-muted-foreground/70")}>
													{segment.verseNumber}
												</span>
											)}
											{segment.chars.map((char) => renderChar(char))}
										</span>
									))}
									{line.breakChar && renderChar(line.breakChar, "inline-block w-[0.35em]")}
								</span>
							))}
						</p>
					))}
				</div>

				{/* Click to focus hint */}
				{!startTime && (
					<div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
						<p className="text-muted-foreground">{t("session.clickToStart")}</p>
					</div>
				)}
			</div>

			{/* Completion stats */}
			{isComplete && (
				<div className="grid grid-cols-3 gap-4">
					<div className="text-center p-4 bg-primary/10 rounded-lg">
						<p className="text-2xl font-bold text-primary">{stats.accuracy}%</p>
						<p className="text-sm text-muted-foreground">{t("session.accuracy")}</p>
					</div>
					<div className="text-center p-4 bg-primary/10 rounded-lg">
						<p className="text-2xl font-bold text-primary">{stats.wpm}</p>
						<p className="text-sm text-muted-foreground">{t("session.wpm")}</p>
					</div>
					<div className="text-center p-4 bg-primary/10 rounded-lg">
						<p className="text-2xl font-bold text-primary">{stats.timeSpentSeconds}s</p>
						<p className="text-sm text-muted-foreground">{t("session.timeSpent")}</p>
					</div>
				</div>
			)}
		</div>
	);
}
