"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { recordActivity } from "@/lib/activityClient";
import { Eye, Keyboard, Headphones, BookOpen, Loader2, NotebookPen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Verse } from "@/app/common/verse/model/Verse";
import { ChapterMentions } from "@/app/common/entity/model/Entity";
import { Note } from "@/app/common/note/model/Note";
import { noteGetForChapterSS } from "@/app/common/note/service/server/noteGetForChapterSS";
import { NotesPanel, NoteComposeRequest } from "@/components/notes";
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
	/** Shown in the notes scope picker, e.g. "This Bible (KJV)". */
	bibleName?: string;
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
	bibleName,
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

	// Notes. The anchor is canonical (bibleId + bookAbbreviation + chapter), so a
	// note written here is found again from any translation of the same passage.
	const [notesOpen, setNotesOpen] = useState(false);
	const [notes, setNotes] = useState<Note[]>([]);
	const [notesLoading, setNotesLoading] = useState(false);
	const [composeRequest, setComposeRequest] = useState<NoteComposeRequest | null>(null);

	const canTakeNotes = Boolean(bibleId && bookAbbreviation && chapterNumber);

	// Reading counts toward the daily streak (once/day/browser, signed-in only).
	useEffect(() => {
		void recordActivity("read");
	}, []);

	const loadNotes = useCallback(async () => {
		// Notes are premium; skip the round trip entirely for everyone else, which
		// keeps anonymous views of the public reader free of extra queries.
		if (!canTakeNotes || !isPremium) return;
		setNotesLoading(true);
		try {
			setNotes(await noteGetForChapterSS(bibleId!, bookAbbreviation!, chapterNumber!));
		} finally {
			setNotesLoading(false);
		}
	}, [canTakeNotes, isPremium, bibleId, bookAbbreviation, chapterNumber]);

	useEffect(() => {
		void loadNotes();
	}, [loadNotes]);

	const noteCountsByVerseNumber = useMemo(() => {
		const counts: Record<number, number> = {};
		for (const note of notes) {
			if (note.targetType === "verse" && note.verse) {
				counts[note.verse] = (counts[note.verse] ?? 0) + 1;
			}
		}
		return counts;
	}, [notes]);

	const openNotes = () => {
		if (!isPremium) {
			setUpgradeOpen(true);
			return;
		}
		setComposeRequest(null);
		setNotesOpen(true);
	};

	const handleVerseNoteClick = (verse: Verse) => {
		if (!isPremium) {
			setUpgradeOpen(true);
			return;
		}
		// A verse that already has notes opens the panel to read them; an untouched
		// verse jumps straight into writing one.
		const hasNotes = (noteCountsByVerseNumber[verse.verseNumber] ?? 0) > 0;
		setComposeRequest(hasNotes ? null : { verseNumber: verse.verseNumber, nonce: Date.now() });
		setNotesOpen(true);
	};

	return (
		<TooltipProvider delayDuration={200}>
			{/* Mode selector */}
			<div className="flex items-center justify-end gap-2 mb-4">
				{canTakeNotes && (
					<Button
						variant="ghost"
						size="sm"
						className="h-8 px-2"
						onClick={openNotes}
						title={t("notes.panelTitle")}
					>
						<NotebookPen className="h-4 w-4 sm:mr-1.5" />
						<span className="hidden sm:inline">{t("notes.panelTitle")}</span>
						{notes.length > 0 && (
							<span className="ml-1.5 rounded-full bg-primary/15 px-1.5 text-xs font-medium text-primary">
								{notes.length}
							</span>
						)}
					</Button>
				)}

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
							noteCountsByVerseNumber={noteCountsByVerseNumber}
							onVerseNoteClick={canTakeNotes ? handleVerseNoteClick : undefined}
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

			{canTakeNotes && isPremium && (
				<NotesPanel
					open={notesOpen}
					onClose={() => setNotesOpen(false)}
					notes={notes}
					isLoading={notesLoading}
					verses={verses}
					composeRequest={composeRequest}
					onChanged={loadNotes}
					context={{
						bibleId: bibleId!,
						bibleName: bibleName ?? "",
						bookAbbreviation: bookAbbreviation!,
						bookName: bookName ?? "",
						chapterNumber: chapterNumber!,
					}}
				/>
			)}

			{upgradeOpen && <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />}
		</TooltipProvider>
	);
}
