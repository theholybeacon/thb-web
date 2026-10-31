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
import { applyTypingKeys, keysFromInputEvent, type TypedCharState, type TypingKey } from "@/app/common/verse/model/typingInput";
import { VERSE_NUMBER_CLASS } from "@/components/reader/ChapterText";
import { keepVerseAnchorInBand } from "@/components/reader/scrollToVerse";

interface TypeModeProps {
	verses: Verse[];
	/** The reader column that scrolls; the cursor is kept in view inside it. */
	scrollerRef?: React.RefObject<HTMLDivElement | null>;
	startVerse?: number | null;
	endVerse?: number | null;
}

/** The folded keystroke accepted here — not necessarily what is painted — and its grade. */
type CharState = TypedCharState;

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
 * the cursor and progress read from.
 */
function buildTypeDocument(blocks: ChapterBlock[]): { blocks: TypeBlock[]; expected: string[] } {
	const expected: string[] = [];
	const take = (display: string): TypeChar => {
		const folded = foldTypedChar(display);
		expected.push(folded);
		return { index: expected.length - 1, display, expected: folded };
	};

	const typeBlocks: TypeBlock[] = blocks.map((block, blockIndex) => ({
		kind: block.kind,
		lines: block.lines.map((line, lineIndex) => {
			const segments = line.parts.map((part, partIndex) => ({
				verseNumber: part.verseNumber,
				isVerseStart: part.isVerseStart,
				chars: [
					...(partIndex > 0 ? [take(" ")] : []),
					...Array.from(typingDisplay(part.text), take),
				],
			}));
			// A line break is worth one keystroke, accepted from Space or Enter, so a
			// typist who instinctively hits either at the end of a line is not
			// punished. The last line of the chapter gets none — there is nothing to
			// carry into. Taken right after the line's text, so its slot sits where
			// it is drawn: at the end of the line, not the end of the chapter.
			const isLast = blockIndex === blocks.length - 1 && lineIndex === block.lines.length - 1;
			return { level: line.level, segments, breakChar: isLast ? undefined : take(" ") };
		}),
	}));

	return { blocks: typeBlocks, expected };
}

export function TypeMode({ verses, scrollerRef, startVerse, endVerse }: TypeModeProps) {
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
	const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);

	// Initialize char states
	useEffect(() => {
		setCharStates(document_.expected.map((char) => ({ char, state: "pending" as const })));
		setCurrentIndex(0);
		setStartTime(null);
		setIsComplete(false);
	}, [document_]);

	// The hidden input is kept for touch devices — tapping the passage is what
	// raises the soft keyboard — but it is not what reads hardware keys. Listening
	// on the document (below) means the passage is typable the moment Type mode is
	// on screen, and stays typable after a click elsewhere steals focus.
	//
	// preventScroll: the input sits at the top of the passage, and focusing it
	// would otherwise yank the reader back up there.
	const focusInput = useCallback(() => inputRef.current?.focus({ preventScroll: true }), []);
	useEffect(() => {
		focusInput();
	}, [focusInput]);

	// Report mode progress to context
	useEffect(() => {
		sessionProgress?.reportModeProgress(currentIndex, charStates.length, isComplete);
	}, [currentIndex, charStates.length, isComplete, sessionProgress]);

	// Typing the passage through counts as finishing the chapter, on both the
	// public reader and inside a study. markComplete is idempotent per chapter.
	useEffect(() => {
		if (!isComplete) return;
		chapterCompletion?.markComplete("type", timeSpentSeconds);
	}, [isComplete, timeSpentSeconds, chapterCompletion]);

	const applyKeys = useCallback(
		(keys: TypingKey[]) => {
			if (isComplete || keys.length === 0) return;

			// Start timer on first keypress
			const startedAt = startTime ?? Date.now();
			if (startTime === null) setStartTime(startedAt);

			const next = applyTypingKeys(charStates, currentIndex, keys);
			setCharStates(next.states);
			setCurrentIndex(next.index);

			if (next.states.length > 0 && next.index >= next.states.length) {
				setTimeSpentSeconds(Math.round((Date.now() - startedAt) / 1000));
				setIsComplete(true);
			}
		},
		[charStates, currentIndex, startTime, isComplete]
	);

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (isComplete) return;

			// Leave browser and OS shortcuts alone — Cmd+R should reload, not type "r".
			if (e.ctrlKey || e.metaKey || e.altKey) return;

			// The notes panel and comment forms are siblings on this page, so a
			// document-level listener has to yield to whatever field is focused. Our
			// own hidden input is the exception: it is where mobile keystrokes land.
			const target = e.target as HTMLElement | null;
			if (
				target &&
				target !== inputRef.current &&
				(target.isContentEditable || /^(input|textarea|select)$/i.test(target.tagName))
			) {
				return;
			}

			// Enter is accepted wherever a Space is — the line breaks in poetry read
			// like somewhere you should press it. Anything else longer than one
			// character is a named key (Shift, Tab) — or Android's "Unidentified",
			// whose text arrives as a beforeinput on the hidden input instead.
			const key = e.key === "Enter" ? " " : e.key;
			if (key !== "Backspace" && key.length !== 1) return;

			// Handled here, so the hidden input never sees it: no beforeinput follows.
			e.preventDefault();
			applyKeys([key]);
		},
		[applyKeys, isComplete]
	);

	// On-screen keyboards that do not report keys on keydown (Android's) still
	// type into the hidden input. Read what they meant, and keep the field empty.
	useEffect(() => {
		const input = inputRef.current;
		if (!input) return;
		const onBeforeInput = (e: InputEvent) => {
			const keys = keysFromInputEvent(e.inputType, e.data);
			if (!keys) return;
			e.preventDefault();
			applyKeys(keys);
		};
		const onInput = () => {
			input.value = "";
		};
		input.addEventListener("beforeinput", onBeforeInput);
		input.addEventListener("input", onInput);
		return () => {
			input.removeEventListener("beforeinput", onBeforeInput);
			input.removeEventListener("input", onInput);
		};
	}, [applyKeys]);

	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	const handleReset = () => {
		setCharStates(document_.expected.map((char) => ({ char, state: "pending" as const })));
		setCurrentIndex(0);
		setStartTime(null);
		setIsComplete(false);
		focusInput();
	};

	// Keep the cursor in view. Only when it drifts out of a comfortable band —
	// re-centring on every keystroke in a dense column is jittery.
	const keepCursorInView = useCallback(() => {
		const cursor = containerRef.current?.querySelector('[data-cursor="true"]');
		keepVerseAnchorInBand(scrollerRef?.current ?? containerRef.current, cursor as HTMLElement | null);
	}, [scrollerRef]);

	useEffect(() => {
		keepCursorInView();
	}, [currentIndex, keepCursorInView]);

	// The reader column shrinks when the on-screen keyboard opens (the shell is
	// sized to what is visible); bring the line being typed back above it.
	useEffect(() => {
		const scroller = scrollerRef?.current;
		if (!scroller || typeof ResizeObserver === "undefined") return;
		const observer = new ResizeObserver(() => keepCursorInView());
		observer.observe(scroller);
		return () => observer.disconnect();
	}, [scrollerRef, keepCursorInView]);

	const renderChar = (char: TypeChar, extraClassName?: string) => {
		const state = charStates[char.index]?.state ?? "pending";
		return (
			<span
				key={char.index}
				data-state={state}
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
		<div className="flex flex-col gap-1 sm:gap-2 h-full">
			{/* Just the text and a way to start over — no scores while you type. */}
			<div className="flex justify-end">
				<Button variant="ghost" size="sm" className="h-7 sm:h-9" onClick={handleReset}>
					<RotateCcw className="h-4 w-4 mr-2" />
					{isComplete ? t("session.tryAgain") : t("common.reset")}
				</Button>
			</div>

			{/* Typing area */}
			<div
				ref={containerRef}
				className="relative p-3 sm:p-6 bg-card rounded-lg border flex-1 min-h-0 cursor-text overflow-y-auto"
				onClick={focusInput}
			>
				{/*
				 * Hidden input for capturing keystrokes. 16px text, or iOS zooms the
				 * page in on focus; no autocorrect or capitals, which on a phone
				 * keyboard would rewrite what the reader typed.
				 */}
				<input
					ref={inputRef}
					type="text"
					className="pointer-events-none absolute left-0 top-0 h-0 w-0 text-base opacity-0"
					autoComplete="off"
					autoCorrect="off"
					autoCapitalize="off"
					spellCheck={false}
					enterKeyHint="next"
					aria-label={t("session.modeType")}
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
			</div>
		</div>
	);
}
