"use client";

import { useTranslations } from "next-intl";
import { BookA, MessagesSquare, NotebookPen, PanelRightClose, Share2, Trophy, Users, X } from "lucide-react";
import type { ChapterMentions } from "@/app/common/entity/model/Entity";
import type { Note } from "@/app/common/note/model/Note";
import type { Verse } from "@/app/common/verse/model/Verse";
import type { ContributionFull } from "@/app/common/community/model/Community";
import type { RefLinkMap } from "@/components/entity/CitationLinks";
import { Button } from "@/components/ui/button";
import { NotesSection, type NoteComposeRequest, type NotesPanelContext } from "@/components/notes";
import type { ReaderSelection } from "@/components/reader/selection/useTextSelection";
import { CommunitySection, type CommunityPanelContext } from "./sections/CommunitySection";
import { ReaderPanelSection } from "./ReaderPanelSection";
import { DictionarySection } from "./sections/DictionarySection";
import { PeopleSection } from "./sections/PeopleSection";
import { ShareSection, type SharePanelContext } from "./sections/ShareSection";
import { ProgressSection } from "./sections/ProgressSection";
import type { ReaderPanelSectionId } from "./useReaderPanel";

export interface ReaderPanelProps {
	bookName?: string;
	chapterNumber?: number;
	mentions?: ChapterMentions;

	/** Current text selection, and what the dictionary needs to resolve it. */
	selection: ReaderSelection | null;
	dictionaryLang: string | null;
	bibleVersion?: string | null;
	bookAbbreviation?: string;
	/** Text of the verse the selection is in, for inferred alignment. */
	selectedVerseText?: string;

	/** Public-reader coordinates for the share links. Absent when the passage has no shareable URL. */
	shareContext?: SharePanelContext;

	/** Notes are premium; when absent the section is not rendered at all. */
	notesContext?: NotesPanelContext;
	notes: Note[];
	notesLoading: boolean;
	verses: Verse[];
	composeRequest?: NoteComposeRequest | null;
	onNotesChanged: () => void;

	/** Scripture discussion is premium; when absent the section is not rendered at all. */
	communityContext?: CommunityPanelContext;
	contributions: ContributionFull[];
	communityLinkMap: RefLinkMap;
	communityLoading: boolean;
	onCommunityChanged: () => void;

	isExpanded: (id: ReaderPanelSectionId) => boolean;
	toggleSection: (id: ReaderPanelSectionId) => void;
	/** Collapses the panel to its rail (desktop) or closes the drawer (mobile). */
	onClose: () => void;
}

/**
 * The dense right-hand info panel for the reader.
 *
 * Rendered in-flow inside ReaderEngine — never viewport-fixed — so that opening
 * it reflows the reading column instead of covering it. Sections are additive:
 * chapter summary and parallel translations still slot in here alongside the
 * existing ones.
 */
export function ReaderPanel({
	bookName,
	chapterNumber,
	mentions,
	selection,
	dictionaryLang,
	bibleVersion,
	bookAbbreviation,
	selectedVerseText,
	shareContext,
	notesContext,
	notes,
	notesLoading,
	verses,
	composeRequest,
	onNotesChanged,
	communityContext,
	contributions,
	communityLinkMap,
	communityLoading,
	onCommunityChanged,
	isExpanded,
	toggleSection,
	onClose,
}: ReaderPanelProps) {
	const t = useTranslations("reader");
	const tJourney = useTranslations("journey");

	return (
		<div className="flex h-full min-h-0 flex-col">
			<header className="flex items-center justify-between gap-2 border-b px-3 py-2.5">
				<div className="min-w-0">
					<h2 className="truncate text-sm font-semibold">{t("panel.title")}</h2>
					{bookName && chapterNumber != null && (
						<p className="truncate text-xs text-muted-foreground">
							{bookName} {chapterNumber}
						</p>
					)}
				</div>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 shrink-0"
					onClick={onClose}
					aria-label={t("panel.collapse")}
				>
					<PanelRightClose className="hidden h-4 w-4 lg:block" />
					<X className="h-4 w-4 lg:hidden" />
				</Button>
			</header>

			<div className="min-h-0 flex-1 overflow-y-auto">
				{/*
				 * First in the panel: a selection reveals this section, and a reader who
				 * just highlighted a word should not have to scroll to find the answer.
				 */}
				<ReaderPanelSection
					icon={BookA}
					title={t("panel.dictionary")}
					expanded={isExpanded("dictionary")}
					onToggle={() => toggleSection("dictionary")}
				>
					<DictionarySection
						selection={selection}
						lang={dictionaryLang}
						bibleVersion={bibleVersion}
						bookAbbreviation={bookAbbreviation}
						chapterNumber={chapterNumber}
						verseText={selectedVerseText}
					/>
				</ReaderPanelSection>

				{/*
				 * Sharing is open to everyone — every target it produces is a public
				 * /bible page, and handing someone a passage is how readers arrive.
				 */}
				{shareContext && (
					<ReaderPanelSection
						icon={Share2}
						title={t("panel.share")}
						expanded={isExpanded("share")}
						onToggle={() => toggleSection("share")}
					>
						<ShareSection
							context={shareContext}
							verses={verses}
							selectedVerseNumber={selection?.verseNumber}
						/>
					</ReaderPanelSection>
				)}

				{/* Renders nothing for anonymous readers — there is no journey to show. */}
				<ReaderPanelSection
					icon={Trophy}
					title={tJourney("title")}
					expanded={isExpanded("progress")}
					onToggle={() => toggleSection("progress")}
				>
					<ProgressSection />
				</ReaderPanelSection>

				<ReaderPanelSection
					icon={Users}
					title={t("panel.people")}
					badge={mentions?.people?.length || undefined}
					expanded={isExpanded("people")}
					onToggle={() => toggleSection("people")}
				>
					<PeopleSection people={mentions?.people} />
				</ReaderPanelSection>

				{notesContext && (
					<ReaderPanelSection
						icon={NotebookPen}
						title={t("panel.notes")}
						badge={notes.length || undefined}
						expanded={isExpanded("notes")}
						onToggle={() => toggleSection("notes")}
					>
						<NotesSection
							notes={notes}
							isLoading={notesLoading}
							context={notesContext}
							verses={verses}
							composeRequest={composeRequest}
							onChanged={onNotesChanged}
						/>
					</ReaderPanelSection>
				)}

				{/* Public discussion on the passage, below the reader's own private notes. */}
				{communityContext && (
					<ReaderPanelSection
						icon={MessagesSquare}
						title={t("panel.community")}
						badge={contributions.length || undefined}
						expanded={isExpanded("community")}
						onToggle={() => toggleSection("community")}
					>
						<CommunitySection
							contributions={contributions}
							linkMap={communityLinkMap}
							isLoading={communityLoading}
							context={communityContext}
							verses={verses}
							onChanged={onCommunityChanged}
						/>
					</ReaderPanelSection>
				)}
			</div>
		</div>
	);
}
