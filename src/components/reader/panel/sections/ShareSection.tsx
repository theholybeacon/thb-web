"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, Link2, Share2 } from "lucide-react";
import type { Verse } from "@/app/common/verse/model/Verse";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "@/lib/toast";

/**
 * What the reader is looking at, in the terms the public /bible routes use.
 *
 * Slugs rather than ids: every share target is a URL someone else has to be
 * able to open, and the public reader is addressed by slug. Without both slugs
 * there is no shareable address, which is why ReaderEngine withholds the whole
 * section instead of rendering a half-working one.
 */
export interface SharePanelContext {
	bibleSlug: string;
	bookSlug: string;
	/** Display name of the translation, e.g. "KJV". */
	bibleName: string;
	bookName: string;
	chapterNumber: number;
}

export type ShareScope = "verse" | "chapter" | "book" | "bible";

interface ShareSectionProps {
	context: SharePanelContext;
	verses: Verse[];
	/** The verse the reader last highlighted, pre-selected in the verse picker. */
	selectedVerseNumber?: number;
}

/**
 * Hands the reader a link to what they are reading, at whichever scope they
 * mean: one verse, the chapter, the whole book, or the translation itself.
 *
 * Verse links are the chapter URL plus `#verse-N` — ReaderEngine already reads
 * that hash on load and on `hashchange`, so a shared verse link opens the
 * chapter scrolled to and highlighting the verse. There is no separate verse
 * route to keep in sync.
 *
 * Not premium-gated: sharing scripture is how people are invited in, and every
 * target it produces is a public page.
 */
export function ShareSection({ context, verses, selectedVerseNumber }: ShareSectionProps) {
	const t = useTranslations("reader.share");
	const [scope, setScope] = useState<ShareScope>("chapter");
	const [verseNumber, setVerseNumber] = useState<number | null>(null);
	const [copied, setCopied] = useState<"link" | "text" | null>(null);

	/*
	 * `window.location.origin` is read after mount rather than during render:
	 * the panel is server-rendered too, and branching on `window` there would
	 * hydrate with a different string.
	 */
	const [origin, setOrigin] = useState("");
	useEffect(() => setOrigin(window.location.origin), []);

	const sortedVerses = useMemo(
		() => [...verses].sort((a, b) => a.verseNumber - b.verseNumber),
		[verses],
	);

	// Highlighting a word and then opening Share should offer that verse, not the
	// first one in the chapter.
	useEffect(() => {
		if (selectedVerseNumber) setVerseNumber(selectedVerseNumber);
	}, [selectedVerseNumber]);

	// Verse scope always needs a concrete verse; fall back to the first one.
	useEffect(() => {
		if (scope === "verse" && verseNumber === null && sortedVerses.length > 0) {
			setVerseNumber(sortedVerses[0].verseNumber);
		}
	}, [scope, verseNumber, sortedVerses]);

	const { bibleSlug, bookSlug, bibleName, bookName, chapterNumber } = context;
	const chapterPath = `/bible/${bibleSlug}/${bookSlug}/${chapterNumber}`;

	const path =
		scope === "bible"
			? `/bible/${bibleSlug}`
			: scope === "book"
				? `/bible/${bibleSlug}/${bookSlug}`
				: scope === "verse" && verseNumber
					? `${chapterPath}#verse-${verseNumber}`
					: chapterPath;

	const url = `${origin}${path}`;

	const reference =
		scope === "bible"
			? bibleName
			: scope === "book"
				? bookName
				: scope === "verse" && verseNumber
					? `${bookName} ${chapterNumber}:${verseNumber}`
					: `${bookName} ${chapterNumber}`;

	/**
	 * The scripture itself, for the scopes where quoting it is the point. A book
	 * or a whole translation has no text short enough to paste, so those share
	 * the link alone.
	 */
	const quotable = (): string | null => {
		if (scope === "verse") {
			const verse = sortedVerses.find((v) => v.verseNumber === verseNumber);
			if (!verse) return null;
			return `“${verse.content.trim()}”\n— ${reference} (${bibleName})\n${url}`;
		}
		if (scope === "chapter" && sortedVerses.length > 0) {
			const body = sortedVerses.map((v) => `${v.verseNumber} ${v.content.trim()}`).join(" ");
			return `${reference} (${bibleName})\n\n${body}\n\n${url}`;
		}
		return null;
	};

	const write = async (value: string, kind: "link" | "text") => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(kind);
			toast.success(kind === "link" ? t("linkCopied") : t("textCopied"));
			setTimeout(() => setCopied(null), 2000);
		} catch {
			// Clipboard access can be denied outright; the link is on screen anyway.
			toast.error(t("copyFailed"));
		}
	};

	const share = async () => {
		if (typeof navigator !== "undefined" && navigator.share) {
			try {
				await navigator.share({ title: reference, text: reference, url });
				return;
			} catch (e) {
				// A dismissed share sheet is a choice, not a failure — do not then
				// hijack the clipboard on the way out.
				if (e instanceof DOMException && e.name === "AbortError") return;
			}
		}
		void write(url, "link");
	};

	const scopeOptions: { value: ShareScope; label: string }[] = [
		{ value: "verse", label: t("optionVerse") },
		{ value: "chapter", label: t("optionChapter", { reference: `${bookName} ${chapterNumber}` }) },
		{ value: "book", label: t("optionBook", { reference: bookName }) },
		{ value: "bible", label: t("optionBible", { reference: bibleName }) },
	];

	const text = quotable();

	return (
		<div className="space-y-2">
			<label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
				{t("scope")}
			</label>
			<Select value={scope} onValueChange={(v) => setScope(v as ShareScope)}>
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
								{bookName} {chapterNumber}:{verse.verseNumber}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			)}

			<p className="truncate rounded-md border bg-muted/40 px-2 py-1.5 text-xs text-muted-foreground" title={url}>
				{path}
			</p>

			<div className="flex flex-wrap gap-2">
				<Button size="sm" className="flex-1" onClick={() => void share()}>
					<Share2 className="mr-1.5 h-4 w-4" />
					{t("shareButton")}
				</Button>
				<Button size="sm" variant="outline" className="flex-1" onClick={() => void write(url, "link")}>
					{copied === "link" ? (
						<Check className="mr-1.5 h-4 w-4" />
					) : (
						<Link2 className="mr-1.5 h-4 w-4" />
					)}
					{t("copyLink")}
				</Button>
			</div>

			{text && (
				<Button size="sm" variant="ghost" className="w-full" onClick={() => void write(text, "text")}>
					{copied === "text" ? (
						<Check className="mr-1.5 h-4 w-4" />
					) : (
						<Copy className="mr-1.5 h-4 w-4" />
					)}
					{t("copyText")}
				</Button>
			)}

			<p className="text-xs text-muted-foreground">{t("hint")}</p>
		</div>
	);
}
