"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { recordActivity } from "@/lib/activityClient";
import { Eye, Keyboard, Headphones, BookOpen, Loader2, NotebookPen, PanelRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Verse } from "@/app/common/verse/model/Verse";
import { ChapterMentions } from "@/app/common/entity/model/Entity";
import { Note } from "@/app/common/note/model/Note";
import { noteGetForChapterSS } from "@/app/common/note/service/server/noteGetForChapterSS";
import { NoteComposeRequest } from "@/components/notes";
import { ReadMode, TypeMode, ListenMode } from "@/app/(app)/session/[id]/components/modes";
import { UpgradeModal } from "@/components/premium/UpgradeModal";
import { ReaderPanel } from "./panel/ReaderPanel";
import { useReaderPanel } from "./panel/useReaderPanel";
import { ChapterCompletionProvider } from "./progress/ChapterCompletionContext";
import { ChapterCompleteButton } from "./progress/ChapterCompleteButton";

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
	/** Gates the premium-only surfaces of the reader (notes). Character links are always open. */
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
	const panel = useReaderPanel();

	// Notes. The anchor is canonical (bibleId + bookAbbreviation + chapter), so a
	// note written here is found again from any translation of the same passage.
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
		panel.revealSection("notes");
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
		panel.revealSection("notes");
	};

	const notesContext =
		canTakeNotes && isPremium
			? {
					bibleId: bibleId!,
					bibleName: bibleName ?? "",
					bookAbbreviation: bookAbbreviation!,
					bookName: bookName ?? "",
					chapterNumber: chapterNumber!,
				}
			: undefined;

	const panelProps = {
		bookName,
		chapterNumber,
		mentions,
		notesContext,
		notes,
		notesLoading,
		verses,
		composeRequest,
		onNotesChanged: loadNotes,
		isExpanded: panel.isExpanded,
		toggleSection: panel.toggleSection,
	};

	return (
		<TooltipProvider delayDuration={200}>
			{/*
			 * Completion tracking wraps the whole reader, not just one surface: this
			 * is the single engine behind both the public Explore reader and the
			 * study session, so mounting the provider here is what finally makes
			 * chapters read from /bible/... count toward the user's journey.
			 */}
			<ChapterCompletionProvider
				bookAbbreviation={bookAbbreviation}
				chapterNumber={chapterNumber}
				bibleId={bibleId}
			>
			{/*
			 * Horizontal split. The panel is a sibling of the reading column rather
			 * than an overlay, so opening it shrinks the text column instead of
			 * covering it — the whole point of moving it out of NotesPanel's old
			 * `fixed inset-y-0 right-0` shell.
			 */}
			<div className="flex h-full min-h-0 w-full">
				<div className="flex min-w-0 flex-1 flex-col">
					{/* Mode selector */}
					<div className="mx-auto flex w-full max-w-4xl items-center justify-end gap-2 px-4 pt-4 md:px-6 md:pt-6">
						<ChapterCompleteButton />

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

						{/* Opens the panel from the rail; hidden while it is already open. */}
						{!panel.open && (
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={panel.openPanel}
								title={t("reader.panel.title")}
								aria-label={t("reader.panel.expand")}
							>
								<PanelRight className="h-4 w-4" />
							</Button>
						)}
					</div>

					{/* Reader column — owns its own scrolling and centring */}
					<div className="min-h-0 flex-1 overflow-y-auto">
						<div className="mx-auto w-full max-w-4xl px-4 py-4 md:px-6 md:py-6">
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
											mentionsByVerse={mentions?.mentionsByVerse}
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
						</div>
					</div>
				</div>

				{/* Desktop: in-flow panel, collapsing to an icon rail. */}
				<aside
					className={cn(
						"hidden shrink-0 flex-col border-l bg-background transition-[width] duration-300 lg:flex",
						panel.open ? "w-80 xl:w-96" : "w-12",
					)}
				>
					{panel.open ? (
						<ReaderPanel {...panelProps} onClose={panel.closePanel} />
					) : (
						<div className="flex flex-col items-center gap-1 py-3">
							<Button
								variant="ghost"
								size="icon"
								className="h-9 w-9"
								onClick={() => panel.revealSection("people")}
								title={t("reader.panel.people")}
								aria-label={t("reader.panel.people")}
							>
								<Users className="h-4 w-4" />
							</Button>
							{notesContext && (
								<Button
									variant="ghost"
									size="icon"
									className="h-9 w-9"
									onClick={() => panel.revealSection("notes")}
									title={t("reader.panel.notes")}
									aria-label={t("reader.panel.notes")}
								>
									<NotebookPen className="h-4 w-4" />
								</Button>
							)}
						</div>
					)}
				</aside>
			</div>

			{/*
			 * Mobile: there is no room to reflow, so below `lg` the panel is a
			 * drawer. It is still owned by the engine, not the page layout.
			 */}
			{panel.open && (
				<div className="lg:hidden">
					<div
						className="fixed inset-0 z-40 bg-black/40"
						onClick={panel.closePanel}
						aria-hidden="true"
					/>
					<aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l bg-background shadow-xl">
						<ReaderPanel {...panelProps} onClose={panel.closePanel} />
					</aside>
				</div>
			)}

			{upgradeOpen && <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />}
			</ChapterCompletionProvider>
		</TooltipProvider>
	);
}
