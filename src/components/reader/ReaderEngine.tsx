"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { recordActivity } from "@/lib/activityClient";
import { Eye, Keyboard, Headphones, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Verse } from "@/app/common/verse/model/Verse";
import { ChapterMentions } from "@/app/common/entity/model/Entity";
import { ReadMode, TypeMode, ListenMode } from "@/app/(app)/session/[id]/components/modes";
import { UpgradeModal } from "@/components/premium/UpgradeModal";

export type ReaderMode = "read" | "type" | "listen";

const MODES: { id: ReaderMode; icon: typeof Eye; labelKey: string }[] = [
	{ id: "read", icon: Eye, labelKey: "session.modeRead" },
	{ id: "type", icon: Keyboard, labelKey: "session.modeType" },
	{ id: "listen", icon: Headphones, labelKey: "session.modeListen" },
];

interface ReaderEngineProps {
	verses: Verse[];
	mode: ReaderMode;
	onModeChange: (mode: ReaderMode) => void;
	bookName?: string;
	chapterNumber?: number;
	startVerse?: number | null;
	endVerse?: number | null;
	explanation?: string | null;
	mentions?: ChapterMentions;
	/** Characters are clickable when premium; otherwise locked with an upgrade prompt. */
	isPremium?: boolean;
	bibleLanguage?: string;
	isLoading?: boolean;

	/** Audio context. Without bibleId/bookAbbreviation, Listen narrates our own content only. */
	bibleId?: string;
	bookAbbreviation?: string;
	/** False for copyrighted translations — scripture is not synthesized. */
	audioEnabled?: boolean;
	studyStepId?: string;
	sessionId?: string;
	isLastChapterInStep?: boolean;
}

/**
 * The single Bible reading engine shared by the public Explore reader and the
 * Study/session reader: mode switch + Read/Type/Listen + character mentions +
 * verse-range highlighting + loading/empty states. Data-fetching and surface
 * chrome (chapter nav vs steps/progress) live in the callers.
 */
export function ReaderEngine({
	verses,
	mode,
	onModeChange,
	bookName,
	chapterNumber,
	startVerse,
	endVerse,
	explanation,
	mentions,
	isPremium = true,
	bibleLanguage,
	isLoading = false,
	bibleId,
	bookAbbreviation,
	audioEnabled = false,
	studyStepId,
	sessionId,
	isLastChapterInStep,
}: ReaderEngineProps) {
	const t = useTranslations();
	const [upgradeOpen, setUpgradeOpen] = useState(false);

	// Reading counts toward the daily streak (once/day/browser, signed-in only).
	useEffect(() => {
		void recordActivity("read");
	}, []);

	return (
		<TooltipProvider delayDuration={200}>
			{/* Mode selector */}
			<div className="flex justify-end mb-4">
				<div className="flex items-center gap-1 bg-muted rounded-lg p-1">
					{MODES.map((m) => (
						<Button
							key={m.id}
							variant={mode === m.id ? "secondary" : "ghost"}
							size="sm"
							className={cn("h-8 px-3", mode === m.id && "bg-background shadow-sm")}
							onClick={() => onModeChange(m.id)}
						>
							<m.icon className="h-4 w-4 mr-1.5" />
							<span className="hidden sm:inline">{t(m.labelKey)}</span>
						</Button>
					))}
				</div>
			</div>

			{/* Content */}
			{isLoading ? (
				<div className="flex items-center justify-center py-16">
					<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
				</div>
			) : verses.length > 0 ? (
				<>
					{mode === "read" && (
						<ReadMode
							verses={verses}
							startVerse={startVerse}
							endVerse={endVerse}
							bookName={bookName}
							chapterNumber={chapterNumber}
							explanation={explanation}
							people={mentions?.people}
							mentionsByVerse={mentions?.mentionsByVerse}
							charactersInteractive={isPremium}
							onLockedCharacterClick={() => setUpgradeOpen(true)}
						/>
					)}

					{mode === "type" && (
						<TypeMode verses={verses} startVerse={startVerse} endVerse={endVerse} explanation={explanation} />
					)}

					{mode === "listen" && (
						<ListenMode
							verses={verses}
							startVerse={startVerse}
							endVerse={endVerse}
							bookName={bookName}
							chapterNumber={chapterNumber}
							bibleLanguage={bibleLanguage}
							explanation={explanation}
							bibleId={bibleId}
							bookAbbreviation={bookAbbreviation}
							audioEnabled={audioEnabled}
							isPremium={isPremium}
							studyStepId={studyStepId}
							sessionId={sessionId}
							isLastChapterInStep={isLastChapterInStep}
							onUpgradeClick={() => setUpgradeOpen(true)}
						/>
					)}
				</>
			) : (
				<div className="text-center py-12">
					<BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
					<p className="text-muted-foreground">{t("bible.noContent")}</p>
				</div>
			)}

			{upgradeOpen && <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />}
		</TooltipProvider>
	);
}
