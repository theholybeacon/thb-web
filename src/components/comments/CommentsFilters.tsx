"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ContributionKind } from "@/app/common/community/model/Community";
import {
	COMMUNITY_FEED_SORTS,
	type CommunityFeedFacets,
	type CommunityFeedQuery,
	type CommunityFeedSort,
	type CommunityFeedSource,
} from "@/app/common/community/model/CommunityFeed";

/** Sentinel for "no filter" — Radix Select forbids an empty-string item value. */
const ANY = "__any__";

const KIND_KEY: Record<ContributionKind, string> = {
	comment: "kindComment",
	fact: "kindFact",
	analysis: "kindAnalysis",
	correction: "kindCorrection",
};

const SORT_KEY: Record<CommunityFeedSort, string> = {
	activity: "sortActivity",
	newest: "sortNewest",
	oldest: "sortOldest",
	score: "sortScore",
	comments: "sortComments",
};

const SOURCES: CommunityFeedSource[] = ["all", "scripture", "entity"];
const SOURCE_KEY: Record<CommunityFeedSource, string> = {
	all: "sourceAll",
	scripture: "sourceScripture",
	entity: "sourceEntity",
};

/**
 * The feed's filter bar.
 *
 * Chapter and verse are free number inputs rather than selects on purpose:
 * populating a chapter dropdown needs `book.numChapters`, which is
 * translation-specific and therefore undefined until a translation is picked —
 * a second query and another cascade failure mode, for a field where typing "3"
 * beats scrolling. Select is reserved for the dimensions whose option set is
 * small, bounded and worth browsing.
 *
 * Note the filter semantics: anchors narrow strictly downward. A chapter filter
 * includes that chapter's verse threads; a verse filter returns only that
 * verse's, never the chapter thread above it. See CommunityFeedFilters.
 */
export function CommentsFilters({
	query,
	facets,
	onChange,
	hasFilters,
	onClear,
}: {
	query: CommunityFeedQuery;
	facets?: CommunityFeedFacets;
	onChange: (patch: Partial<CommunityFeedQuery>) => void;
	hasFilters: boolean;
	onClear: () => void;
}) {
	const t = useTranslations("comments");

	// Debounced locally so a three-digit chapter is one navigation, not three.
	const [chapter, setChapter] = useState(query.chapter ? String(query.chapter) : "");
	const [verse, setVerse] = useState(query.verse ? String(query.verse) : "");

	// Resync when the URL changes from anywhere else — a cascade clear, a Back
	// navigation, or the Clear button.
	useEffect(() => setChapter(query.chapter ? String(query.chapter) : ""), [query.chapter]);
	useEffect(() => setVerse(query.verse ? String(query.verse) : ""), [query.verse]);

	useEffect(() => {
		const current = query.chapter ? String(query.chapter) : "";
		if (chapter === current) return;
		const id = setTimeout(() => onChange({ chapter: chapter ? Number(chapter) : undefined }), 400);
		return () => clearTimeout(id);
	}, [chapter, query.chapter, onChange]);

	useEffect(() => {
		const current = query.verse ? String(query.verse) : "";
		if (verse === current) return;
		const id = setTimeout(() => onChange({ verse: verse ? Number(verse) : undefined }), 400);
		return () => clearTimeout(id);
	}, [verse, query.verse, onChange]);

	const kinds = facets?.kinds ?? [];
	const isEntitySource = query.source === "entity";

	return (
		<div className="mb-6 space-y-3">
			{/* Row 1: sort + source */}
			<div className="flex flex-wrap items-center gap-2">
				<Select value={query.sort} onValueChange={(v) => onChange({ sort: v as CommunityFeedSort })}>
					<SelectTrigger className="h-9 w-[190px]" aria-label={t("sortBy")}>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{COMMUNITY_FEED_SORTS.map((s) => (
							<SelectItem key={s} value={s}>
								{t(SORT_KEY[s])}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<div className="flex flex-wrap gap-1">
					{SOURCES.map((s) => {
						const count =
							s === "all"
								? (facets?.sources.scripture ?? 0) + (facets?.sources.entity ?? 0)
								: facets?.sources[s];
						return (
							<Button
								key={s}
								variant="ghost"
								size="sm"
								className={cn("h-9", query.source === s && "bg-primary/10 text-primary")}
								onClick={() => onChange({ source: s })}
							>
								{t(SOURCE_KEY[s])}
								{count != null && <span className="ml-1.5 text-xs text-muted-foreground">{count}</span>}
							</Button>
						);
					})}
				</div>

				{hasFilters && (
					<Button variant="ghost" size="sm" className="ml-auto h-9" onClick={onClear}>
						<X className="h-3.5 w-3.5" />
						{t("clearFilters")}
					</Button>
				)}
			</div>

			{/* Row 2: scripture anchor. Meaningless for character threads, whose
			    scripture columns are all null by the anchor CHECK constraint. */}
			<div className="flex flex-wrap items-center gap-2">
				<Select
					value={query.bibleId ?? ANY}
					onValueChange={(v) => onChange({ bibleId: v === ANY ? undefined : v })}
					disabled={isEntitySource}
				>
					<SelectTrigger className="h-9 w-[200px]" aria-label={t("translation")}>
						<SelectValue placeholder={t("allTranslations")} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={ANY}>{t("allTranslations")}</SelectItem>
						{(facets?.bibles ?? []).map((b) => (
							<SelectItem key={b.bibleId} value={b.bibleId}>
								{b.name} ({b.count})
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Select
					value={query.bookAbbreviation ?? ANY}
					onValueChange={(v) => onChange({ bookAbbreviation: v === ANY ? undefined : v })}
					disabled={isEntitySource}
				>
					<SelectTrigger className="h-9 w-[200px]" aria-label={t("book")}>
						<SelectValue placeholder={t("allBooks")} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={ANY}>{t("allBooks")}</SelectItem>
						{(facets?.books ?? []).map((b) => (
							<SelectItem key={b.bookAbbreviation} value={b.bookAbbreviation}>
								{b.bookName} ({b.count})
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Input
					type="number"
					min={1}
					inputMode="numeric"
					className="h-9 w-24"
					placeholder={t("chapter")}
					aria-label={t("chapter")}
					value={chapter}
					disabled={isEntitySource || !query.bookAbbreviation}
					onChange={(e) => setChapter(e.target.value)}
				/>
				<Input
					type="number"
					min={1}
					inputMode="numeric"
					className="h-9 w-24"
					placeholder={t("verse")}
					aria-label={t("verse")}
					value={verse}
					disabled={isEntitySource || !query.chapter}
					onChange={(e) => setVerse(e.target.value)}
				/>
			</div>

			{/* Row 3: author + kind */}
			<div className="flex flex-wrap items-center gap-2">
				<Select
					value={query.authorUserId ?? ANY}
					onValueChange={(v) => onChange({ authorUserId: v === ANY ? undefined : v })}
					disabled={query.mineOnly}
				>
					<SelectTrigger className="h-9 w-[200px]" aria-label={t("author")}>
						<SelectValue placeholder={t("allAuthors")} />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={ANY}>{t("allAuthors")}</SelectItem>
						{(facets?.authors ?? []).map((a) => (
							<SelectItem key={a.userId} value={a.userId}>
								{a.name} ({a.count})
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Button
					variant="ghost"
					size="sm"
					className={cn("h-9", query.mineOnly && "bg-primary/10 text-primary")}
					onClick={() => onChange({ mineOnly: !query.mineOnly })}
				>
					{t("mineOnly")}
				</Button>

				<div className="flex flex-wrap gap-1">
					<Button
						variant="ghost"
						size="sm"
						className={cn("h-9", !query.kind && "bg-primary/10 text-primary")}
						onClick={() => onChange({ kind: undefined })}
					>
						{t("kindAll")}
					</Button>
					{(Object.keys(KIND_KEY) as ContributionKind[]).map((k) => {
						const count = kinds.find((c) => c.kind === k)?.count;
						return (
							<Button
								key={k}
								variant="ghost"
								size="sm"
								className={cn("h-9", query.kind === k && "bg-primary/10 text-primary")}
								onClick={() => onChange({ kind: k })}
							>
								{t(KIND_KEY[k])}
								{count != null && <span className="ml-1.5 text-xs text-muted-foreground">{count}</span>}
							</Button>
						);
					})}
				</div>
			</div>
		</div>
	);
}
