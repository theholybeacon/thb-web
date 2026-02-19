"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Verse } from "@/app/common/verse/model/Verse";
import { useOptionalSessionProgress } from "../../context/SessionProgressContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, RotateCcw, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";

interface ListenModeProps {
	verses: Verse[];
	startVerse?: number | null;
	endVerse?: number | null;
	bookName?: string;
	chapterNumber?: number;
	bibleLanguage?: string;
	explanation?: string | null;
}

function toBcp47(language?: string): string {
	const map: Record<string, string> = {
		english: "en-US",
		spanish: "es-ES",
		portuguese: "pt-BR",
		french: "fr-FR",
		german: "de-DE",
		italian: "it-IT",
		chinese: "zh-CN",
	};
	return map[language?.toLowerCase() ?? ""] ?? "en-US";
}

export function ListenMode({ verses, startVerse, endVerse, bookName, chapterNumber, bibleLanguage, explanation }: ListenModeProps) {
	const t = useTranslations();
	const sessionProgress = useOptionalSessionProgress();

	// Filter verses to only those in range, sorted by verse number
	const filteredVerses = useMemo(() => {
		const filtered = verses.filter((v) => {
			if (!startVerse) return true;
			const end = endVerse ?? startVerse;
			return v.verseNumber >= startVerse && v.verseNumber <= end;
		});
		return filtered.sort((a, b) => a.verseNumber - b.verseNumber);
	}, [verses, startVerse, endVerse]);

	const [isPlaying, setIsPlaying] = useState(false);
	const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
	const [speechRate, setSpeechRate] = useState(1);
	const [isComplete, setIsComplete] = useState(false);
	const [startTime, setStartTime] = useState<number | null>(null);
	const [timeSpent, setTimeSpent] = useState(0);
	const [showControls, setShowControls] = useState(true);
	const [titleSpoken, setTitleSpoken] = useState(false);
	const [explanationSpoken, setExplanationSpoken] = useState(false);

	const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
	const synthRef = useRef<SpeechSynthesis | null>(null);
	const versesContainerRef = useRef<HTMLDivElement>(null);

	// Initialize speech synthesis
	useEffect(() => {
		if (typeof window !== "undefined") {
			synthRef.current = window.speechSynthesis;
		}
		return () => {
			synthRef.current?.cancel();
		};
	}, []);

	// Track time spent
	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (isPlaying && startTime) {
			interval = setInterval(() => {
				setTimeSpent(Math.round((Date.now() - startTime) / 1000));
			}, 1000);
		}
		return () => clearInterval(interval);
	}, [isPlaying, startTime]);

	// Auto-scroll to top on mount / filteredVerses change
	useEffect(() => {
		if (versesContainerRef.current) {
			versesContainerRef.current.scrollTop = 0;
		}
	}, [filteredVerses.length]);

	// Report mode progress to context
	useEffect(() => {
		sessionProgress?.reportModeProgress(currentVerseIndex, filteredVerses.length, isComplete);
	}, [currentVerseIndex, filteredVerses.length, isComplete, sessionProgress]);

	const speakVerse = useCallback(
		(index: number) => {
			if (!synthRef.current || index >= filteredVerses.length) {
				setIsPlaying(false);
				setIsComplete(true);
				return;
			}

			const verse = filteredVerses[index];
			const text = verse.content;

			synthRef.current.cancel();

			const utterance = new SpeechSynthesisUtterance(text);
			utterance.rate = speechRate;
			utterance.lang = toBcp47(bibleLanguage);

			utterance.onend = () => {
				if (index < filteredVerses.length - 1) {
					setCurrentVerseIndex(index + 1);
					speakVerse(index + 1);
				} else {
					setIsPlaying(false);
					setIsComplete(true);
				}
			};

			utterance.onerror = (e) => {
				console.error("Speech error:", e);
				setIsPlaying(false);
				toast.error(t("session.speechError"));
			};

			utteranceRef.current = utterance;
			synthRef.current.speak(utterance);
		},
		[filteredVerses, speechRate, bibleLanguage]
	);

	const speakTitle = useCallback(() => {
		if (!titleSpoken && bookName && chapterNumber) {
			let titleText = `${bookName} ${chapterNumber}`;
			if (startVerse) {
				titleText += `:${startVerse}`;
				if (endVerse && endVerse !== startVerse) {
					titleText += `-${endVerse}`;
				}
			}
			const titleUtterance = new SpeechSynthesisUtterance(titleText);
			titleUtterance.rate = speechRate;
			titleUtterance.lang = toBcp47(bibleLanguage);
			titleUtterance.onend = () => {
				setTitleSpoken(true);
				speakVerse(0);
			};
			titleUtterance.onerror = () => {
				setTitleSpoken(true);
				speakVerse(0);
			};
			synthRef.current?.speak(titleUtterance);
		} else {
			speakVerse(0);
		}
	}, [titleSpoken, bookName, chapterNumber, startVerse, endVerse, speechRate, bibleLanguage, speakVerse]);

	const handlePlay = () => {
		if (!startTime) {
			setStartTime(Date.now());
		}
		setIsPlaying(true);

		// Order: AI insight (explanation) → chapter title → verses
		if (currentVerseIndex === 0 && !explanationSpoken && explanation) {
			synthRef.current?.cancel();
			const explUtterance = new SpeechSynthesisUtterance(explanation);
			explUtterance.rate = speechRate;
			explUtterance.lang = toBcp47(bibleLanguage);
			explUtterance.onend = () => {
				setExplanationSpoken(true);
				speakTitle();
			};
			explUtterance.onerror = () => {
				setExplanationSpoken(true);
				speakTitle();
			};
			synthRef.current?.speak(explUtterance);
		} else if (currentVerseIndex === 0 && !titleSpoken) {
			synthRef.current?.cancel();
			speakTitle();
		} else {
			speakVerse(currentVerseIndex);
		}
	};

	const handlePause = () => {
		setIsPlaying(false);
		synthRef.current?.cancel();
	};

	const handlePrevious = () => {
		const newIndex = Math.max(0, currentVerseIndex - 1);
		setCurrentVerseIndex(newIndex);
		if (isPlaying) {
			synthRef.current?.cancel();
			speakVerse(newIndex);
		}
	};

	const handleNext = () => {
		const newIndex = Math.min(filteredVerses.length - 1, currentVerseIndex + 1);
		setCurrentVerseIndex(newIndex);
		if (isPlaying) {
			synthRef.current?.cancel();
			speakVerse(newIndex);
		}
	};

	const handleRateChange = (value: number[]) => {
		setSpeechRate(value[0]);
	};

	const handleReset = () => {
		synthRef.current?.cancel();
		setCurrentVerseIndex(0);
		setIsPlaying(false);
		setIsComplete(false);
		setStartTime(null);
		setTimeSpent(0);
		setTitleSpoken(false);
		setExplanationSpoken(false);
	};

	const progress = filteredVerses.length > 0 ? ((currentVerseIndex + 1) / filteredVerses.length) * 100 : 0;

	return (
		<div className="flex flex-col min-h-full">
			<div className="flex-1 max-w-4xl mx-auto w-full space-y-6">
				{explanation && (
					<div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
						<div className="flex items-start gap-2">
							<Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
							<p className="text-sm leading-relaxed italic text-muted-foreground">{explanation}</p>
						</div>
					</div>
				)}

				{/* Header with reference */}
				{bookName && chapterNumber && (
					<div className="text-center pb-4 border-b">
						<h2 className="text-2xl font-serif font-semibold">
							{bookName} {chapterNumber}
							{startVerse && `:${startVerse}${endVerse && endVerse !== startVerse ? `-${endVerse}` : ""}`}
						</h2>
					</div>
				)}

				{/* Verses display */}
				<div ref={versesContainerRef} className="space-y-4 p-4 pb-32">
				{filteredVerses.map((verse, index) => (
					<p
						key={verse.id}
						className={cn(
							"leading-relaxed text-base md:text-lg transition-all duration-300",
							index === currentVerseIndex && isPlaying
								? "text-foreground scale-[1.02] bg-primary/10 p-3 rounded-lg -mx-3"
								: index < currentVerseIndex
									? "text-foreground"
									: "text-muted-foreground/50"
						)}
					>
						<sup className={cn(
							"text-xs font-semibold mr-1.5 select-none",
							index <= currentVerseIndex ? "text-primary" : "text-muted-foreground"
						)}>
							{verse.verseNumber}
						</sup>
						<span>{verse.content}</span>
					</p>
				))}
				</div>
			</div>

			{/* Fixed controls panel */}
			{showControls ? (
				<div className="sticky bottom-0 -mx-3 md:-mx-6 -mb-3 md:-mb-6 bg-card border-t shadow-lg p-4">
					<div className="max-w-4xl mx-auto space-y-3">
						{/* Progress bar + collapse button */}
						<div className="flex items-center gap-2">
							<div className="flex-1 space-y-2">
								<div className="h-2 bg-muted rounded-full overflow-hidden">
									<div
										className="h-full bg-primary rounded-full transition-all duration-300"
										style={{ width: `${progress}%` }}
									/>
								</div>
								<div className="flex justify-between text-xs text-muted-foreground">
									<span>
										{t("session.verse")} {currentVerseIndex + 1} / {filteredVerses.length}
									</span>
									<span>{timeSpent}s</span>
								</div>
							</div>
							<button
								onClick={() => setShowControls(false)}
								className="ml-2 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
							>
								<ChevronDown className="h-4 w-4" />
							</button>
						</div>

						{/* Playback controls */}
						<div className="flex items-center justify-center gap-4">
							<Button variant="ghost" size="icon" onClick={handlePrevious} disabled={currentVerseIndex === 0}>
								<SkipBack className="h-5 w-5" />
							</Button>

							{isPlaying ? (
								<Button size="lg" className="h-14 w-14 rounded-full" onClick={handlePause}>
									<Pause className="h-6 w-6" />
								</Button>
							) : isComplete ? (
								<Button size="lg" className="h-14 w-14 rounded-full" variant="outline" onClick={handleReset}>
									<RotateCcw className="h-6 w-6" />
								</Button>
							) : (
								<Button size="lg" className="h-14 w-14 rounded-full" onClick={handlePlay}>
									<Play className="h-6 w-6 ml-1" />
								</Button>
							)}

							<Button
								variant="ghost"
								size="icon"
								onClick={handleNext}
								disabled={currentVerseIndex === filteredVerses.length - 1}
							>
								<SkipForward className="h-5 w-5" />
							</Button>
						</div>

						{/* Speed control */}
						<div className="flex items-center gap-4 px-4">
							<Volume2 className="h-4 w-4 text-muted-foreground" />
							<span className="text-sm text-muted-foreground min-w-[60px]">{t("session.speed")}</span>
							<Slider
								value={[speechRate]}
								onValueChange={handleRateChange}
								min={0.5}
								max={2}
								step={0.1}
								className="flex-1"
							/>
							<span className="text-sm font-mono min-w-[40px]">{speechRate.toFixed(1)}x</span>
						</div>
					</div>
				</div>
			) : (
				<div className="sticky bottom-0 -mx-3 md:-mx-6 -mb-3 md:-mb-6 bg-card border-t px-4 py-2">
					<div className="max-w-4xl mx-auto flex items-center justify-between">
						<span className="text-xs text-muted-foreground">
							{t("session.verse")} {currentVerseIndex + 1} / {filteredVerses.length}
						</span>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							onClick={isPlaying ? handlePause : isComplete ? handleReset : handlePlay}
						>
							{isPlaying ? <Pause className="h-4 w-4" /> : isComplete ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />}
						</Button>
						<button
							onClick={() => setShowControls(true)}
							className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
						>
							<ChevronUp className="h-4 w-4" />
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
