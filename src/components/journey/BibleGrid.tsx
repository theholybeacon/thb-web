"use client";

import { useTranslations } from "next-intl";
import { BookProgress } from "@/app/common/completion/model/Completion";
import { cn } from "@/lib/utils";

/**
 * Every chapter of the Bible as one square, filled in as you read.
 *
 * This is the answer to the problem the whole feature exists for: someone who
 * reads by topic, character or need has their progress scattered across dozens
 * of books and no way to see the shape of it. A grid shows coverage and gaps at
 * a glance in a way no percentage can — and it is the part worth screenshotting.
 *
 * 1189 plain divs is well within what the browser handles without virtualization,
 * and native `title` tooltips are used rather than Radix ones precisely because
 * there are 1189 of them.
 */

/** Deeper fill the more times a chapter has been revisited. */
function cellClass(times: number): string {
	if (times <= 0) return "bg-muted hover:bg-muted-foreground/30";
	if (times === 1) return "bg-primary/40 hover:bg-primary/60";
	if (times === 2) return "bg-primary/70 hover:bg-primary/80";
	return "bg-primary hover:bg-primary/90";
}

function BookRow({ book }: { book: BookProgress }) {
	const t = useTranslations("journey");
	const done = book.completed === book.chapters;

	return (
		<div className="flex items-start gap-2 sm:gap-3">
			<div
				className={cn(
					"w-20 shrink-0 pt-0.5 text-right text-[11px] leading-4 sm:w-28 sm:text-xs",
					done ? "font-medium text-foreground" : "text-muted-foreground",
				)}
				title={`${book.name} — ${book.completed}/${book.chapters}`}
			>
				{book.name}
			</div>
			<div className="flex min-w-0 flex-1 flex-wrap gap-[2px]">
				{book.times.map((times, i) => {
					const chapter = i + 1;
					return (
						<div
							key={chapter}
							title={
								times > 0
									? t("gridCellRead", { book: book.name, chapter, count: times })
									: t("gridCellUnread", { book: book.name, chapter })
							}
							className={cn(
								"h-2.5 w-2.5 rounded-[2px] transition-colors sm:h-3 sm:w-3",
								cellClass(times),
							)}
						/>
					);
				})}
			</div>
		</div>
	);
}

export function BibleGrid({ books }: { books: BookProgress[] }) {
	const t = useTranslations("journey");
	const ot = books.filter((b) => b.testament === "OT");
	const nt = books.filter((b) => b.testament === "NT");

	return (
		<div className="rounded-lg border bg-card p-5">
			<div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
				<h2 className="font-heading text-lg font-semibold">{t("gridTitle")}</h2>
				<Legend />
			</div>
			<p className="mb-5 text-xs text-muted-foreground">{t("gridHint")}</p>

			<div className="space-y-6">
				<section className="space-y-1.5">
					<h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						{t("oldTestament")}
					</h3>
					{ot.map((book) => (
						<BookRow key={book.usfm} book={book} />
					))}
				</section>

				<section className="space-y-1.5">
					<h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						{t("newTestament")}
					</h3>
					{nt.map((book) => (
						<BookRow key={book.usfm} book={book} />
					))}
				</section>
			</div>
		</div>
	);
}

function Legend() {
	return (
		<div className="flex items-center gap-1.5" aria-hidden="true">
			{[0, 1, 2, 3].map((times) => (
				<div key={times} className={cn("h-2.5 w-2.5 rounded-[2px]", cellClass(times))} />
			))}
		</div>
	);
}
