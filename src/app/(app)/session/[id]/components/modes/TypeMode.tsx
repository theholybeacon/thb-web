"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Verse } from "@/app/common/verse/model/Verse";
import { useOptionalSessionProgress } from "../../context/SessionProgressContext";
import { Button } from "@/components/ui/button";
import { RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface TypeModeProps {
	verses: Verse[];
	startVerse?: number | null;
	endVerse?: number | null;
	explanation?: string | null;
}

interface CharState {
	char: string;
	state: "pending" | "correct" | "incorrect";
}

function normalizeForTyping(text: string): string {
	return text
		.replace(/[\u2018\u2019\u02BC]/g, "'")   // curly single quotes → straight
		.replace(/[\u201C\u201D]/g, '"')          // curly double quotes → straight
		.replace(/[\u2013\u2014]/g, '-')          // en/em dash → hyphen
		.replace(/\u2026/g, '...')                // ellipsis → three dots
		.replace(/^\s+/gm, '')                   // remove leading whitespace (indentation)
		.replace(/\s+/g, ' ')                    // collapse multiple spaces
		.trim();
}

export function TypeMode({ verses, startVerse, endVerse, explanation }: TypeModeProps) {
	const t = useTranslations();
	const sessionProgress = useOptionalSessionProgress();
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

	// Build the full text to type with verse numbers
	const fullText = filteredVerses
		.map((v) => `${v.verseNumber} ${normalizeForTyping(v.content)}`)
		.join(" ");

	const [charStates, setCharStates] = useState<CharState[]>([]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [startTime, setStartTime] = useState<number | null>(null);
	const [isComplete, setIsComplete] = useState(false);
	const [stats, setStats] = useState({ accuracy: 0, wpm: 0, timeSpentSeconds: 0 });

	// Initialize char states
	useEffect(() => {
		setCharStates(
			fullText.split("").map((char) => ({
				char,
				state: "pending" as const,
			}))
		);
		setCurrentIndex(0);
		setStartTime(null);
		setIsComplete(false);
	}, [fullText]);

	// Focus input on mount
	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	// Report mode progress to context
	useEffect(() => {
		sessionProgress?.reportModeProgress(currentIndex, charStates.length, isComplete);
	}, [currentIndex, charStates.length, isComplete, sessionProgress]);

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

			// Ignore modifier keys and special keys
			if (e.key.length !== 1) return;

			const expectedChar = charStates[currentIndex]?.char;
			if (!expectedChar) return;

			const isCorrect = e.key === expectedChar;

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
		setCharStates(
			fullText.split("").map((char) => ({
				char,
				state: "pending" as const,
			}))
		);
		setCurrentIndex(0);
		setStartTime(null);
		setIsComplete(false);
		inputRef.current?.focus();
	};

	// Auto-scroll to keep cursor visible
	useEffect(() => {
		if (containerRef.current) {
			const container = containerRef.current;
			const cursorElement = container.querySelector('[data-cursor="true"]');
			if (cursorElement) {
				cursorElement.scrollIntoView({ block: "center", behavior: "smooth" });
			}
		}
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

	return (
		<div className="flex flex-col gap-6 h-full">
			{explanation && (
				<div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
					<div className="flex items-start gap-2">
						<Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
						<p className="text-sm leading-relaxed italic text-muted-foreground">{explanation}</p>
					</div>
				</div>
			)}

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

				{/* Rendered text */}
				<div className="font-mono text-lg leading-loose select-none">
					{(() => {
						// Group characters into words for proper line wrapping
						const words: { startIndex: number; chars: CharState[] }[] = [];
						let currentWord: CharState[] = [];
						let wordStartIndex = 0;

						charStates.forEach((charState, index) => {
							if (charState.char === " ") {
								if (currentWord.length > 0) {
									words.push({ startIndex: wordStartIndex, chars: currentWord });
									currentWord = [];
								}
								words.push({ startIndex: index, chars: [charState] });
								wordStartIndex = index + 1;
							} else {
								if (currentWord.length === 0) {
									wordStartIndex = index;
								}
								currentWord.push(charState);
							}
						});
						if (currentWord.length > 0) {
							words.push({ startIndex: wordStartIndex, chars: currentWord });
						}

						return words.map((word, wordIndex) => (
							<span key={wordIndex} className="inline">
								{word.chars.map((charState, charIndex) => {
									const globalIndex = word.startIndex + charIndex;
									return (
										<span
											key={globalIndex}
											data-cursor={globalIndex === currentIndex ? "true" : undefined}
											className={cn(
												"transition-colors",
												charState.state === "pending" && "text-muted-foreground/40",
												charState.state === "correct" && "text-foreground",
												charState.state === "incorrect" && "text-destructive bg-destructive/20",
												globalIndex === currentIndex && "border-l-2 border-primary animate-pulse"
											)}
										>
											{charState.char === " " ? "\u00A0" : charState.char}
										</span>
									);
								})}
							</span>
						));
					})()}
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
