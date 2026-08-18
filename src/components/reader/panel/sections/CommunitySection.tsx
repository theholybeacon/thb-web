"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Loader2, MessagesSquare, Plus } from "lucide-react";
import type { Verse } from "@/app/common/verse/model/Verse";
import type {
	ContributionFull,
	ScriptureTargetType,
} from "@/app/common/community/model/Community";
import type { NotesPanelContext } from "@/components/notes";
import type { RefLinkMap } from "@/components/entity/CitationLinks";
import { CommunityContext } from "@/components/community/CommunityContext";
import { ContributionItem } from "@/components/community/ContributionItem";
import { AddContributionForm } from "@/components/community/AddContributionForm";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

/**
 * The chapter being read, in canonical coordinates. Identical to what notes
 * needs, so it is the same object — ReaderEngine builds it once and passes it
 * to both sections.
 */
export type CommunityPanelContext = NotesPanelContext;

interface CommunitySectionProps {
	contributions: ContributionFull[];
	linkMap: RefLinkMap;
	isLoading: boolean;
	context: CommunityPanelContext;
	verses: Verse[];
	/** Re-runs the panel's loader. The reader fetches client-side, so a route refresh would do nothing. */
	onChanged: () => void;
}

const SECTION_LABEL_KEY: Record<ScriptureTargetType, string> = {
	verse: "sectionVerse",
	chapter: "sectionChapter",
	book: "sectionBook",
	bible: "sectionBible",
};

/**
 * Public discussion on the passage being read.
 *
 * Structured like NotesSection — the same four scopes, the same composer — but
 * the threads themselves are the shared community components, so replies,
 * voting and flagging behave exactly as they do on a character page.
 *
 * Only rendered for premium readers (ReaderEngine withholds the context
 * otherwise), which is why the provider hands down an unconditional
 * `requirePremium`: there is no non-premium state to upsell from here.
 */
export function CommunitySection({
	contributions,
	linkMap,
	isLoading,
	context,
	verses,
	onChanged,
}: CommunitySectionProps) {
	const t = useTranslations("reader.community");
	const [composing, setComposing] = useState(false);
	const [scope, setScope] = useState<ScriptureTargetType>("chapter");
	const [verseNumber, setVerseNumber] = useState<number | null>(null);

	const sortedVerses = useMemo(
		() => [...verses].sort((a, b) => a.verseNumber - b.verseNumber),
		[verses],
	);

	// Verse scope always needs a concrete verse; fall back to the first one.
	useEffect(() => {
		if (scope === "verse" && verseNumber === null && sortedVerses.length > 0) {
			setVerseNumber(sortedVerses[0].verseNumber);
		}
	}, [scope, verseNumber, sortedVerses]);

	/**
	 * Chapter threads first, then one group per verse in passage order, then the
	 * broader book and translation scopes. Verse groups are dynamic — only the
	 * verses that actually have discussion get a heading.
	 */
	const grouped = useMemo(() => {
		const chapter: ContributionFull[] = [];
		const book: ContributionFull[] = [];
		const bible: ContributionFull[] = [];
		const byVerse = new Map<number, ContributionFull[]>();

		for (const c of contributions) {
			if (c.targetType === "verse" && c.verse != null) {
				const bucket = byVerse.get(c.verse) ?? [];
				bucket.push(c);
				byVerse.set(c.verse, bucket);
			} else if (c.targetType === "chapter") chapter.push(c);
			else if (c.targetType === "book") book.push(c);
			else if (c.targetType === "bible") bible.push(c);
		}

		return {
			chapter,
			book,
			bible,
			byVerse: [...byVerse.entries()].sort((a, b) => a[0] - b[0]),
		};
	}, [contributions]);

	const scopeOptions: { value: ScriptureTargetType; label: string }[] = [
		{ value: "verse", label: t("onThisVerse") },
		{
			value: "chapter",
			label: t("onThisChapter", { reference: `${context.bookName} ${context.chapterNumber}` }),
		},
		{ value: "book", label: t("onThisBook", { reference: context.bookName }) },
		{ value: "bible", label: t("onThisBible", { reference: context.bibleName }) },
	];

	const target = {
		kind: "scripture" as const,
		targetType: scope,
		bibleId: context.bibleId,
		bookAbbreviation: scope === "bible" ? null : context.bookAbbreviation,
		chapter: scope === "chapter" || scope === "verse" ? context.chapterNumber : null,
		verse: scope === "verse" ? verseNumber : null,
	};

	const renderGroup = (key: string, heading: ReactNode, items: ContributionFull[]) =>
		items.length === 0 ? null : (
			<section key={key} className="space-y-1">
				<h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{heading}</h3>
				{items.map((c) => (
					<ContributionItem key={c.id} contribution={c} linkMap={linkMap} />
				))}
			</section>
		);

	return (
		<CommunityContext.Provider
			value={{ isPremium: true, requirePremium: () => true, onChanged }}
		>
			<div className="space-y-4">
				{composing ? (
					<div className="space-y-2 rounded-lg border bg-card p-3">
						<label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
							{t("scope")}
						</label>
						<Select value={scope} onValueChange={(v) => setScope(v as ScriptureTargetType)}>
							<SelectTrigger className="h-9">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{scopeOptions.map((option) => (
									<SelectItem
										key={option.value}
										value={option.value}
										disabled={option.value === "verse" && sortedVerses.length === 0}
									>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{scope === "verse" && (
							<Select
								value={verseNumber ? String(verseNumber) : ""}
								onValueChange={(v) => setVerseNumber(Number(v))}
							>
								<SelectTrigger className="h-9">
									<SelectValue placeholder={t("selectVerse")} />
								</SelectTrigger>
								<SelectContent>
									{sortedVerses.map((verse) => (
										<SelectItem key={verse.id} value={String(verse.verseNumber)}>
											{context.bookName} {context.chapterNumber}:{verse.verseNumber}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}

						<AddContributionForm
							target={target}
							kinds={[]}
							placeholder={t("placeholder")}
							onDone={() => setComposing(false)}
						/>
					</div>
				) : (
					<Button className="w-full" size="sm" onClick={() => setComposing(true)}>
						<Plus className="mr-2 h-4 w-4" />
						{t("newDiscussion")}
					</Button>
				)}

				{isLoading && (
					<div className="flex justify-center py-8">
						<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
					</div>
				)}

				{!isLoading && contributions.length === 0 && !composing && (
					<div className="py-8 text-center">
						<MessagesSquare className="mx-auto mb-3 h-9 w-9 text-muted-foreground/30" />
						<p className="text-sm text-muted-foreground">{t("noDiscussionsHere")}</p>
					</div>
				)}

				{renderGroup("chapter", t(SECTION_LABEL_KEY.chapter), grouped.chapter)}

				{grouped.byVerse.map(([verse, items]) =>
					renderGroup(
						`verse-${verse}`,
						// Jumps the reading column to the verse: ReaderEngine already
						// listens for hashchange and scrolls + highlights the target.
						<a href={`#verse-${verse}`} className="hover:text-primary hover:underline">
							{context.bookName} {context.chapterNumber}:{verse}
						</a>,
						items,
					),
				)}

				{renderGroup("book", t(SECTION_LABEL_KEY.book), grouped.book)}
				{renderGroup("bible", t(SECTION_LABEL_KEY.bible), grouped.bible)}
			</div>
		</CommunityContext.Provider>
	);
}
