import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, BookOpen, Check, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { canonBook, NT_BOOKS, OT_BOOKS } from "@/app/common/canon/model/canon";
import { formatStepReference, normalizeStep, parsePassageQuery } from "@/app/common/studyBuilder/model/draft";
import type { StudyBuilderDraftStep } from "@/app/common/studyBuilder/model/StudyBuilder";

type Reference = Pick<StudyBuilderDraftStep, "bookAbbreviation" | "chapterNumber" | "verseNumber">;

type Props = {
	/** Book names in the chosen translation, by USFM code. */
	names: Map<string, string>;
	onAdd: (step: StudyBuilderDraftStep) => void;
	disabled?: boolean;
};

/**
 * The manual half of the builder: find any passage and add it to the plan.
 * Type a book or a whole reference ("John 3:16"), or browse: book, then a
 * chapter (or two, for a range), then, if wanted, just some of its verses.
 */
export function PassageFinder({ names, onAdd, disabled }: Props) {
	const t = useTranslations("studyBuilder.manual");
	const [query, setQuery] = useState("");
	const [book, setBook] = useState<string | null>(null);
	const [chapters, setChapters] = useState<{ start: number; end: number } | null>(null);
	const [verseFrom, setVerseFrom] = useState("");
	const [verseTo, setVerseTo] = useState("");
	const [lastAdded, setLastAdded] = useState<string | null>(null);

	const nameOf = (usfm: string) => names.get(usfm) ?? canonBook(usfm)?.englishName ?? usfm;
	const parsed = useMemo(() => parsePassageQuery(query, names), [query, names]);

	function add(reference: Reference) {
		const step = normalizeStep({ ...reference, title: formatStepReference(reference, names) });
		if (!step) return;
		onAdd(step);
		const label = formatStepReference(step, names);
		setLastAdded(label);
		setTimeout(() => setLastAdded((current) => (current === label ? null : current)), 2000);
	}

	function openBook(usfm: string) {
		setBook(usfm);
		setChapters(null);
		setVerseFrom("");
		setVerseTo("");
		setQuery("");
	}

	function tapChapter(n: number) {
		setVerseFrom("");
		setVerseTo("");
		setChapters((current) => {
			// A second tap on another chapter makes a range; a tap after a range starts over.
			if (current && current.start === current.end && current.start !== n) {
				return { start: Math.min(current.start, n), end: Math.max(current.start, n) };
			}
			return { start: n, end: n };
		});
	}

	const selected: Reference | null = book
		? {
			bookAbbreviation: book,
			chapterNumber: chapters ? (chapters.start === chapters.end ? String(chapters.start) : `${chapters.start}-${chapters.end}`) : null,
			verseNumber: chapters && chapters.start === chapters.end && verseFrom
				? (verseTo && Number(verseTo) > Number(verseFrom) ? `${verseFrom}-${verseTo}` : verseFrom)
				: null,
		}
		: null;

	return (
		<div className="flex h-full flex-col overflow-hidden rounded-2xl lg:min-h-[420px] border bg-muted/20" data-testid="builder-finder">
			<div className="border-b bg-card p-3">
				<div className="flex items-center gap-2 rounded-xl border bg-background px-3 focus-within:ring-2 focus-within:ring-primary/40">
					<Search className="h-4 w-4 shrink-0 text-muted-foreground" />
					<input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && parsed.reference) {
								e.preventDefault();
								add(parsed.reference);
								setQuery("");
							}
						}}
						placeholder={t("searchPlaceholder")}
						aria-label={t("searchLabel")}
						disabled={disabled}
						className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
					/>
				</div>
				<div className={cn("grid transition-all duration-300", lastAdded ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")} aria-live="polite" data-testid="builder-finder-added">
					<p className="flex items-center gap-1.5 overflow-hidden text-xs font-medium text-green-700 dark:text-green-500">
						<Check className="h-3.5 w-3.5" /> {lastAdded && t("added", { reference: lastAdded })}
					</p>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-4">
				{query.trim() ? (
					<div className="space-y-3">
						{parsed.reference && (
							<Button className="w-full justify-start animate-in fade-in" disabled={disabled} onClick={() => { add(parsed.reference!); setQuery(""); }} data-testid="builder-finder-add-typed">
								<Plus className="mr-2 h-4 w-4" /> {t("add", { reference: formatStepReference(parsed.reference, names) })}
							</Button>
						)}
						{parsed.books.length > 0 ? (
							<ul className="space-y-1">
								{parsed.books.map((usfm) => (
									<li key={usfm}>
										<button type="button" onClick={() => openBook(usfm)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted">
											<BookOpen className="h-4 w-4 text-primary" />
											<span className="flex-1 font-medium">{nameOf(usfm)}</span>
											<span className="text-xs text-muted-foreground">{t("chapterCount", { count: canonBook(usfm)!.chapters })}</span>
										</button>
									</li>
								))}
							</ul>
						) : (
							!parsed.reference && <p className="py-6 text-center text-sm text-muted-foreground">{t("noMatches", { query: query.trim() })}</p>
						)}
					</div>
				) : book ? (
					<div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300" data-testid="builder-finder-book">
						<div className="flex items-center gap-2">
							<Button variant="ghost" size="sm" className="-ml-2" onClick={() => setBook(null)}>
								<ArrowLeft className="mr-1 h-4 w-4" /> {t("back")}
							</Button>
						</div>
						<div className="flex items-end justify-between gap-3">
							<div>
								<h3 className="text-xl font-bold">{nameOf(book)}</h3>
								<p className="text-xs text-muted-foreground">{t("chaptersHint")}</p>
							</div>
							<Button variant="outline" size="sm" disabled={disabled} onClick={() => add({ bookAbbreviation: book, chapterNumber: null, verseNumber: null })}>
								<Plus className="mr-1 h-3.5 w-3.5" /> {t("wholeBook")}
							</Button>
						</div>
						<div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8 lg:grid-cols-6 xl:grid-cols-8" role="group" aria-label={t("chapters")}>
							{Array.from({ length: canonBook(book)!.chapters }, (_, i) => i + 1).map((n) => {
								const inRange = chapters && n >= chapters.start && n <= chapters.end;
								const isEdge = chapters && (n === chapters.start || n === chapters.end);
								return (
									<button
										key={n}
										type="button"
										onClick={() => tapChapter(n)}
										aria-pressed={Boolean(inRange)}
										className={cn(
											"h-9 rounded-md border text-sm tabular-nums transition-colors",
											isEdge ? "border-primary bg-primary text-primary-foreground" : inRange ? "border-primary/30 bg-primary/15 text-primary" : "bg-background hover:border-primary/50 hover:bg-primary/5",
										)}
									>
										{n}
									</button>
								);
							})}
						</div>

						{chapters && chapters.start === chapters.end && (
							<div className="rounded-xl border bg-background p-3 animate-in fade-in slide-in-from-top-1">
								<p className="mb-2 text-xs font-medium text-muted-foreground">{t("verses")}</p>
								<div className="flex items-center gap-2 text-sm">
									<Input type="number" min={1} value={verseFrom} onChange={(e) => setVerseFrom(e.target.value)} aria-label={t("verseFrom")} placeholder={t("verseFrom")} className="h-9 w-28" />
									<span className="text-muted-foreground">{t("verseTo")}</span>
									<Input type="number" min={1} value={verseTo} onChange={(e) => setVerseTo(e.target.value)} disabled={!verseFrom} aria-label={t("verseToLabel")} className="h-9 w-20" />
								</div>
							</div>
						)}

						{selected && chapters && (
							<Button className="w-full animate-in fade-in" disabled={disabled} onClick={() => { add(selected); setChapters(null); setVerseFrom(""); setVerseTo(""); }} data-testid="builder-finder-add">
								<Plus className="mr-2 h-4 w-4" /> {t("add", { reference: formatStepReference(selected, names) })}
							</Button>
						)}
					</div>
				) : (
					<div className="space-y-5">
						{[{ label: t("oldTestament"), books: OT_BOOKS }, { label: t("newTestament"), books: NT_BOOKS }].map((group) => (
							<section key={group.label}>
								<h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group.label}</h3>
								<div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
									{group.books.map((b) => (
										<button
											key={b.usfm}
											type="button"
											onClick={() => openBook(b.usfm)}
											className="truncate rounded-md border bg-background px-2.5 py-2 text-left text-sm transition-colors hover:border-primary/50 hover:bg-primary/5"
										>
											{nameOf(b.usfm)}
										</button>
									))}
								</div>
							</section>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
