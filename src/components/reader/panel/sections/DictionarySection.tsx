"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { dictionaryLookupSS } from "@/app/common/dictionary/service/server/dictionaryLookupSS";
import { alignmentLookupSS } from "@/app/common/alignment/service/server/alignmentLookupSS";
import type { DictionaryLookupResult } from "@/app/common/dictionary/model/Dictionary";
import type { AlignmentLookupResult, AlignedOriginal } from "@/app/common/alignment/model/Alignment";
import type { ReaderSelection } from "@/components/reader/selection/useTextSelection";

export interface DictionarySectionProps {
	selection: ReaderSelection | null;
	/** ISO code of the translation's language; null disables the dictionary half. */
	lang: string | null;
	/** `bible.version`, used to find an exact alignment source. */
	bibleVersion?: string | null;
	bookAbbreviation?: string;
	chapterNumber?: number;
	/** Text of the selected verse, needed to infer alignment for es/pt/it. */
	verseText?: string;
}

/** How many original-language words to show before collapsing the verse list. */
const VERSE_WORD_LIMIT = 14;

/**
 * Applied at render as well as at fetch: rows cached before the caps were
 * tightened still hold the full Wiktionary entry, and re-fetching the whole
 * cache to reformat it would be absurd.
 */
const RENDER_POS_LIMIT = 3;
const RENDER_SENSE_LIMIT = 4;

/** Polling for a cold book being pulled from Blob. Books load in seconds. */
const POLL_INTERVAL_MS = 2500;
const POLL_MAX_TRIES = 12;

/**
 * Definition and original-language data for the reader's current selection.
 *
 * Two independent lookups sharing one surface, because they answer different
 * questions: the dictionary says what the word means in its own language, the
 * alignment says which Greek or Hebrew word the translator was rendering. Each
 * renders as soon as it resolves; neither blocks the other.
 *
 * Mounted inside ReaderEngine, which also serves the public /bible tree — that
 * tree is outside ClientProviders, so this uses plain effects and server
 * actions rather than react-query.
 */
export function DictionarySection({
	selection,
	lang,
	bibleVersion,
	bookAbbreviation,
	chapterNumber,
	verseText,
}: DictionarySectionProps) {
	const t = useTranslations("reader");
	const [dictionary, setDictionary] = useState<DictionaryLookupResult | null>(null);
	const [alignment, setAlignment] = useState<AlignmentLookupResult | null>(null);
	const [loading, setLoading] = useState(false);
	const [showAllVerseWords, setShowAllVerseWords] = useState(false);

	useEffect(() => {
		if (!selection) return;

		let cancelled = false;
		setLoading(true);
		setDictionary(null);
		setAlignment(null);
		setShowAllVerseWords(false);

		const lookupAlignment = () =>
			bookAbbreviation && chapterNumber
				? alignmentLookupSS({
						bibleVersion,
						lang,
						bookAbbreviation,
						chapter: chapterNumber,
						verse: selection.verseNumber,
						selection: selection.text,
						occurrence: selection.occurrence,
						verseText,
					})
				: Promise.resolve(null);

		void (async () => {
			const [dict, align] = await Promise.all([
				lang ? dictionaryLookupSS(selection.text, lang) : Promise.resolve(null),
				lookupAlignment(),
			]);
			if (cancelled) return;
			setDictionary(dict);
			setAlignment(align);
			setLoading(false);

			/*
			 * `loading` means this book is being fetched from Blob right now — the
			 * self-healing path after a database reset. Poll until it lands rather
			 * than telling the reader there is no original-language data.
			 */
			let current = align;
			for (let tries = 0; current?.status === "loading" && tries < POLL_MAX_TRIES; tries++) {
				await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
				if (cancelled) return;
				current = await lookupAlignment();
				if (cancelled) return;
				setAlignment(current);
			}
		})();

		return () => {
			cancelled = true;
		};
		// `nonce` changes on every selection, including re-selecting the same word.
	}, [selection?.nonce, selection, lang, bibleVersion, bookAbbreviation, chapterNumber, verseText]);

	if (!selection) {
		return <p className="text-sm text-muted-foreground">{t("dictionary.hint")}</p>;
	}

	const verseWords = alignment?.verseWords ?? [];
	const visibleVerseWords = showAllVerseWords ? verseWords : verseWords.slice(0, VERSE_WORD_LIMIT);

	return (
		<div className="space-y-4">
			<p className="text-sm font-medium break-words">
				<span className="font-serif">{selection.text}</span>
			</p>

			{loading && (
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<Loader2 className="h-4 w-4 animate-spin" />
					{t("dictionary.loading")}
				</div>
			)}

			{/* --- Definition ---------------------------------------------------- */}
			{dictionary?.status === "ready" && dictionary.payload && (
				<div className="space-y-3">
					{dictionary.payload.entries.slice(0, RENDER_POS_LIMIT).map((entry, i) => (
						<div key={`${entry.partOfSpeech}-${i}`}>
							<p className="flex flex-wrap items-baseline gap-2">
								{entry.partOfSpeech && (
									<span className="text-xs font-medium uppercase tracking-wide text-primary">
										{entry.partOfSpeech}
									</span>
								)}
								{entry.pronunciations[0] && (
									<span className="text-xs text-muted-foreground">
										{entry.pronunciations[0].text}
									</span>
								)}
							</p>
							<ol className="mt-1 space-y-1.5">
								{entry.senses.slice(0, RENDER_SENSE_LIMIT).map((sense, j) => (
									<li key={j} className="text-sm leading-snug">
										<span className="mr-1 text-xs tabular-nums text-muted-foreground">{j + 1}.</span>
										{sense.definition}
										{sense.examples[0] && (
											<span className="mt-0.5 block text-xs italic text-muted-foreground">
												{sense.examples[0]}
											</span>
										)}
									</li>
								))}
							</ol>
						</div>
					))}
				</div>
			)}

			{dictionary?.status === "notFound" && (
				<p className="text-sm text-muted-foreground">{t("dictionary.noDefinition")}</p>
			)}

			{/* --- Original language --------------------------------------------- */}
			{alignment?.status === "loading" && (
				<div className="border-t pt-3">
					<p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
						{t("dictionary.originalLanguage")}
					</p>
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin" />
						{t("dictionary.loadingOriginal")}
					</div>
				</div>
			)}

			{alignment?.tier && (
				<div className="border-t pt-3">
					<p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
						{t("dictionary.originalLanguage")}
					</p>

					{alignment.matched.length > 0 ? (
						<div className="space-y-2">
							{alignment.matched.map((word) => (
								<OriginalWord key={word.strongs} word={word} prominent />
							))}
							{alignment.tier === "sibling" && (
								<p className="text-xs text-muted-foreground">
									{t("dictionary.tierSibling", { source: alignment.sourceLabel ?? "" })}
								</p>
							)}
							{/*
							 * Deliberately not styled like the editorial tiers. This match is a
							 * model's pick from the verse's known Greek — about 95% accurate,
							 * with no reliable signal for which 5% is wrong. Readers build
							 * teaching on this, so the caveat travels with the answer.
							 */}
							{alignment.tier === "inferred" && (
								<p className="rounded-md border border-dashed px-2 py-1.5 text-xs text-muted-foreground">
									<span className="font-medium text-foreground">{t("dictionary.tierInferredBadge")}</span>{" "}
									{t("dictionary.tierInferred")}
								</p>
							)}
						</div>
					) : (
						<div className="space-y-2">
							{/*
							 * No word-level match, so we must not imply one. This is the only
							 * tier available for translations with no alignment of their own —
							 * Portuguese, Italian, German and Spanish today.
							 */}
							<p className="text-xs text-muted-foreground">
								{t("dictionary.tierVerse", { verse: selection.verseNumber })}
							</p>
							{visibleVerseWords.map((word, i) => (
								<OriginalWord key={`${word.strongs}-${i}`} word={word} />
							))}
							{verseWords.length > VERSE_WORD_LIMIT && !showAllVerseWords && (
								<button
									type="button"
									onClick={() => setShowAllVerseWords(true)}
									className="text-xs font-medium text-primary hover:underline"
								>
									{t("dictionary.showAll", { count: verseWords.length })}
								</button>
							)}
						</div>
					)}
				</div>
			)}

			{/* --- Attribution (a licence condition, not a courtesy) -------------- */}
			{(dictionary?.payload || alignment?.attribution) && (
				<div className="space-y-0.5 border-t pt-3 text-[11px] leading-snug text-muted-foreground">
					{dictionary?.payload && (
						<p>
							{t("dictionary.creditDictionary")}{" "}
							{dictionary.payload.sourceUrl && (
								<a
									href={dictionary.payload.sourceUrl}
									target="_blank"
									rel="noreferrer noopener"
									className="underline hover:text-foreground"
								>
									{t("dictionary.creditWiktionaryLink")}
								</a>
							)}
						</p>
					)}
					{alignment?.attribution && (
						<>
							<p>{alignment.attribution}</p>
							<p>{t("dictionary.creditLexicon")}</p>
						</>
					)}
				</div>
			)}
		</div>
	);
}

function OriginalWord({ word, prominent = false }: { word: AlignedOriginal; prominent?: boolean }) {
	const gloss = word.shortDefinition ?? word.definition;
	return (
		<div className={prominent ? "rounded-md bg-muted/60 p-2" : undefined}>
			<p className="flex flex-wrap items-baseline gap-x-2">
				<span className={prominent ? "font-serif text-base" : "font-serif text-sm"}>{word.lemma}</span>
				{word.translit && <span className="text-xs italic text-muted-foreground">{word.translit}</span>}
				<span className="text-[11px] tabular-nums text-muted-foreground">{word.strongs}</span>
			</p>
			{gloss && <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{gloss}</p>}
		</div>
	);
}
