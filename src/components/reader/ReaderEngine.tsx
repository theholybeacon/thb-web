"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { languageNameToIso } from "@/lib/bibleLanguage";
import { useTranslations } from "next-intl";
import { recordActivity } from "@/lib/activityClient";
import { BookA, Eye, Keyboard, Headphones, BookOpen, Loader2, MessagesSquare, NotebookPen, PanelRight, Share2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Verse } from "@/app/common/verse/model/Verse";
import { ChapterMentions } from "@/app/common/entity/model/Entity";
import { Note } from "@/app/common/note/model/Note";
import { noteGetForChapterSS } from "@/app/common/note/service/server/noteGetForChapterSS";
import { NoteComposeRequest } from "@/components/notes";
import type { ContributionFull } from "@/app/common/community/model/Community";
import type { RefLinkMap } from "@/components/entity/CitationLinks";
import { scriptureCommunityListSS } from "@/app/common/community/service/server/scriptureCommunityListSS";
import { ReadMode, TypeMode, ListenMode } from "@/app/(app)/session/[id]/components/modes";
import { UpgradeModal } from "@/components/premium/UpgradeModal";
import { ReaderPanel } from "./panel/ReaderPanel";
import { useReaderPanel } from "./panel/useReaderPanel";
import { StepExplanationBanner } from "./StepExplanationBanner";
import { ChapterCompletionProvider } from "./progress/ChapterCompletionContext";
import { ChapterCompleteButton } from "./progress/ChapterCompleteButton";
import { useTextSelection } from "./selection/useTextSelection";
import { scrollVerseAnchorToTop } from "./scrollToVerse";
import { isShortRange, parseVerseHash, toVerseRange, type VerseRange } from "./verseHighlight";

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
	/**
	 * `bible.version` verbatim (KJV, BSB, RVR09). Kept separate from `bibleName`,
	 * which falls back to the full title when a version is missing — the
	 * alignment registry matches on the version code and must not be fed a title.
	 */
	bibleVersion?: string | null;
	/**
	 * Public-reader slugs. Sharing addresses the /bible tree by slug, so without
	 * both of these there is no link to hand out and the share section is hidden.
	 */
	bibleSlug?: string;
	bookSlug?: string;
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
	bibleVersion,
	bibleSlug,
	bookSlug,
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
	const scrollerRef = useRef<HTMLDivElement>(null);

	// Type mode renders its own select-none tree, so it yields no selection and
	// needs no exclusion here.
	const selection = useTextSelection();
	const dictionaryLang = useMemo(() => languageNameToIso(bibleLanguage), [bibleLanguage]);

	// The selected verse's own text. Languages with no editorial alignment infer
	// their original-language match from it, so it has to reach the panel.
	const selectedVerseText = useMemo(
		() => (selection ? verses.find((v) => v.verseNumber === selection.verseNumber)?.content ?? undefined : undefined),
		[selection, verses],
	);

	// Notes. The anchor is canonical (bibleId + bookAbbreviation + chapter), so a
	// note written here is found again from any translation of the same passage.
	const [notes, setNotes] = useState<Note[]>([]);
	const [notesLoading, setNotesLoading] = useState(false);
	const [composeRequest, setComposeRequest] = useState<NoteComposeRequest | null>(null);

	// Public discussion on the passage. Loaded eagerly rather than on expand:
	// the section badge is a count, so the query happens either way.
	const [contributions, setContributions] = useState<ContributionFull[]>([]);
	const [communityLinkMap, setCommunityLinkMap] = useState<RefLinkMap>({});
	const [communityLoading, setCommunityLoading] = useState(false);

	// Canonical chapter coordinates. The precondition for notes and for community
	// discussion alike — both anchor on bibleId + bookAbbreviation + chapter.
	const hasChapterAnchor = Boolean(bibleId && bookAbbreviation && chapterNumber);

	// Reading counts toward the daily streak (once/day/browser, signed-in only).
	useEffect(() => {
		void recordActivity("read");
	}, []);

	/*
	 * `#verse-N` / `#verse-N-M` deep links (verse of the day, daily emails, note
	 * links, character citations). Kept in state rather than read once at scroll
	 * time, because the target is also what gets highlighted — and re-read on
	 * `hashchange` so a second link into the chapter already on screen moves the
	 * mark instead of doing nothing.
	 */
	const [hashRange, setHashRange] = useState<VerseRange | null>(null);
	useEffect(() => {
		const read = () => setHashRange(parseVerseHash(window.location.hash));
		read();
		window.addEventListener("hashchange", read);
		return () => window.removeEventListener("hashchange", read);
	}, []);

	/*
	 * The jump can only be honoured once the verses exist, and the reader scrolls
	 * inside a nested container rather than the document — so native fragment
	 * scrolling both races the fetch and lands under the toolbar.
	 */
	useEffect(() => {
		if (isLoading || verses.length === 0 || !hashRange) return;
		const timeout = setTimeout(() => {
			scrollVerseAnchorToTop(scrollerRef.current, document.getElementById(`verse-${hashRange.start}`));
		}, 100);
		return () => clearTimeout(timeout);
	}, [isLoading, verses, hashRange]);

	/*
	 * How the passage in question is pointed at. A long range still dims what
	 * falls outside it — that is what makes its extent readable at a glance — but
	 * a step asking for a verse or two greys out a whole chapter to point at one
	 * line, so those are marked in place instead and the context stays legible.
	 *
	 * The step's own range wins over a deep link: it is the passage the reader
	 * was sent here to read.
	 */
	const passageRange = useMemo(() => toVerseRange(startVerse, endVerse), [startVerse, endVerse]);
	const dimOutsideRange = passageRange != null && !isShortRange(passageRange);
	const highlightRange = (passageRange && !dimOutsideRange ? passageRange : null) ?? hashRange;

	/*
	 * Instant-on-selection: highlighting reveals the dictionary rather than
	 * requiring a second action. Keyed on `nonce` so re-selecting the same word
	 * re-opens a panel the reader has since collapsed.
	 */
	useEffect(() => {
		if (!selection) return;
		panel.revealSection("dictionary");
		// `panel` is rebuilt each render; depending on it would loop.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selection?.nonce]);

	const loadNotes = useCallback(async () => {
		// Notes are premium; skip the round trip entirely for everyone else, which
		// keeps anonymous views of the public reader free of extra queries.
		if (!hasChapterAnchor || !isPremium) return;
		setNotesLoading(true);
		try {
			setNotes(await noteGetForChapterSS(bibleId!, bookAbbreviation!, chapterNumber!));
		} finally {
			setNotesLoading(false);
		}
	}, [hasChapterAnchor, isPremium, bibleId, bookAbbreviation, chapterNumber]);

	useEffect(() => {
		void loadNotes();
	}, [loadNotes]);

	const loadCommunity = useCallback(async () => {
		// Same reasoning as notes: scripture discussion is premium, so anonymous
		// views of the public reader make no extra round trip.
		if (!hasChapterAnchor || !isPremium) return;
		setCommunityLoading(true);
		try {
			const data = await scriptureCommunityListSS(bibleId!, bookAbbreviation!, chapterNumber!);
			setContributions(data.contributions);
			setCommunityLinkMap(data.linkMap);
		} finally {
			setCommunityLoading(false);
		}
	}, [hasChapterAnchor, isPremium, bibleId, bookAbbreviation, chapterNumber]);

	useEffect(() => {
		void loadCommunity();
	}, [loadCommunity]);

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

	/*
	 * The canonical coordinates both premium panel sections need. Built once and
	 * handed to notes and community alike, so there is no second condition to
	 * keep in sync — and withholding it is what hides both sections.
	 */
	const chapterContext =
		hasChapterAnchor && isPremium
			? {
					bibleId: bibleId!,
					bibleName: bibleName ?? "",
					bookAbbreviation: bookAbbreviation!,
					bookName: bookName ?? "",
					chapterNumber: chapterNumber!,
				}
			: undefined;

	/*
	 * Share targets. Independent of `chapterContext`: sharing is neither premium
	 * nor anchored on canonical ids — it needs the public URL slugs, which both
	 * reading surfaces know but which are absent if a caller omits them.
	 */
	const shareContext =
		bibleSlug && bookSlug && bookName && chapterNumber
			? {
					bibleSlug,
					bookSlug,
					bibleName: bibleName ?? bibleVersion ?? "",
					bookName,
					chapterNumber,
				}
			: undefined;

	const panelProps = {
		bookName,
		chapterNumber,
		mentions,
		selection,
		dictionaryLang,
		bibleVersion,
		bookAbbreviation,
		selectedVerseText,
		shareContext,
		notesContext: chapterContext,
		notes,
		notesLoading,
		verses,
		composeRequest,
		onNotesChanged: loadNotes,
		communityContext: chapterContext,
		contributions,
		communityLinkMap,
		communityLoading,
		onCommunityChanged: loadCommunity,
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

						{hasChapterAnchor && (
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

					{/*
					 * Pinned above the scroller, not inside it: the step insight has to stay
					 * on screen while the chapter scrolls under it.
					 */}
					<StepExplanationBanner explanation={explanation} />

					{/* Reader column — owns its own scrolling and centring */}
					<div ref={scrollerRef} className="min-h-0 flex-1 overflow-y-auto">
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
											scrollerRef={scrollerRef}
											startVerse={startVerse}
											endVerse={endVerse}
											highlightRange={highlightRange}
											dimOutsideRange={dimOutsideRange}
											bookName={bookName}
											chapterNumber={chapterNumber}
											mentionsByVerse={mentions?.mentionsByVerse}
											noteCountsByVerseNumber={noteCountsByVerseNumber}
											onVerseNoteClick={hasChapterAnchor ? handleVerseNoteClick : undefined}
										/>
									)}

									{mode === "type" && (
										<TypeMode verses={verses} startVerse={startVerse} endVerse={endVerse} />
									)}

									{mode === "listen" && (
										<ListenMode
											verses={verses}
											scrollerRef={scrollerRef}
											startVerse={startVerse}
											endVerse={endVerse}
											bookName={bookName}
											chapterNumber={chapterNumber}
											bibleLanguage={bibleLanguage}
											mentionsByVerse={mentions?.mentionsByVerse}
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
								onClick={() => panel.revealSection("dictionary")}
								title={t("reader.panel.dictionary")}
								aria-label={t("reader.panel.dictionary")}
							>
								<BookA className="h-4 w-4" />
							</Button>
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
							{shareContext && (
								<Button
									variant="ghost"
									size="icon"
									className="h-9 w-9"
									onClick={() => panel.revealSection("share")}
									title={t("reader.panel.share")}
									aria-label={t("reader.panel.share")}
								>
									<Share2 className="h-4 w-4" />
								</Button>
							)}
							{chapterContext && (
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
							{chapterContext && (
								<Button
									variant="ghost"
									size="icon"
									className="h-9 w-9"
									onClick={() => panel.revealSection("community")}
									title={t("reader.panel.community")}
									aria-label={t("reader.panel.community")}
								>
									<MessagesSquare className="h-4 w-4" />
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
