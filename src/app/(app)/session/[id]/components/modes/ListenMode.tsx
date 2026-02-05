"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Verse } from "@/app/common/verse/model/Verse";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";

interface ListenModeProps {
	verses: Verse[];
	startVerse?: number | null;
	endVerse?: number | null;
	bookName?: string;
	chapterNumber?: number;
	bibleLanguage?: string;
	isLastChapter?: boolean;
	showCompletion?: boolean;
	onComplete?: (stats: { timeSpentSeconds: number }) => void;
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

export function ListenMode({ verses, startVerse, endVerse, bookName, chapterNumber, bibleLanguage, isLastChapter = true, showCompletion = true, onComplete }: ListenModeProps) {
	const t = useTranslations();

	// Filter verses to only those in range
	const filteredVerses = verses.filter((v) => {
		if (!startVerse) return true;
		const end = endVerse ?? startVerse;
		return v.verseNumber >= startVerse && v.verseNumber <= end;
	});

	const [isPlaying, setIsPlaying] = useState(false);
	const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
	const [speechRate, setSpeechRate] = useState(1);
	const [isComplete, setIsComplete] = useState(false);
	const [startTime, setStartTime] = useState<number | null>(null);
	const [timeSpent, setTimeSpent] = useState(0);

	const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
	const synthRef = useRef<SpeechSynthesis | null>(null);

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

	const handlePlay = () => {
		if (!startTime) {
			setStartTime(Date.now());
		}
		setIsPlaying(true);
		speakVerse(currentVerseIndex);
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

	const handleComplete = () => {
		onComplete?.({ timeSpentSeconds: timeSpent });
	};

	const handleReset = () => {
		synthRef.current?.cancel();
		setCurrentVerseIndex(0);
		setIsPlaying(false);
		setIsComplete(false);
		setStartTime(null);
		setTimeSpent(0);
	};

	const progress = filteredVerses.length > 0 ? ((currentVerseIndex + 1) / filteredVerses.length) * 100 : 0;

	return (
		<div className="space-y-6">
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
			<div className="space-y-4 max-h-[400px] overflow-y-auto p-4">
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

			{/* Player controls */}
			<div className="bg-card rounded-lg border p-4 space-y-4">
				{/* Progress bar */}
				<div className="space-y-2">
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

				{/* Playback controls */}
				<div className="flex items-center justify-center gap-4">
					<Button variant="ghost" size="icon" onClick={handlePrevious} disabled={currentVerseIndex === 0}>
						<SkipBack className="h-5 w-5" />
					</Button>

					{isPlaying ? (
						<Button size="lg" className="h-14 w-14 rounded-full" onClick={handlePause}>
							<Pause className="h-6 w-6" />
						</Button>
					) : (
						<Button size="lg" className="h-14 w-14 rounded-full" onClick={handlePlay} disabled={isComplete}>
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

			{/* Completion */}
			{isComplete && (
				<div className="p-6 bg-primary/10 rounded-lg border border-primary/30">
					<div className="flex items-center gap-3 mb-4">
						<CheckCircle2 className="h-8 w-8 text-primary" />
						<h3 className="text-xl font-semibold">{t("session.listenComplete")}</h3>
					</div>
					<p className="text-muted-foreground mb-6">
						{t("session.listenedFor", { seconds: timeSpent })}
					</p>
					<div className="flex gap-3">
						<Button variant="outline" onClick={handleReset}>
							{t("session.listenAgain")}
						</Button>
						{showCompletion && onComplete && (
							<Button onClick={handleComplete}>
								{isLastChapter ? (
									<>
										<CheckCircle2 className="h-4 w-4 mr-2" />
										{t("session.completeStep")}
									</>
								) : (
									<>
										{t("session.nextChapter")}
										<ChevronRight className="h-4 w-4 ml-2" />
									</>
								)}
							</Button>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
