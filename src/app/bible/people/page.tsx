import Link from "next/link";
import type { Metadata } from "next";
import { Users, Search } from "lucide-react";
import { entityListForIndexSS } from "@/app/common/entity/service/server/entityListForIndexSS";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CHARACTER_INDEX_MIN_MENTIONS } from "@/lib/seo";
import { cn } from "@/lib/utils";

type PageProps = {
	searchParams: Promise<{ letter?: string; q?: string; page?: string }>;
};

export const metadata: Metadata = {
	title: "Bible Characters A-Z | The Holy Beacon",
	description:
		"Browse every person named in the Bible — from Aaron to Zechariah — with their scripture references, timelines and historical context.",
	alternates: { canonical: "/bible/people" },
	openGraph: {
		title: "Bible Characters A-Z",
		description: "Browse every person named in the Bible, with their scripture references.",
		type: "website",
		siteName: "The Holy Beacon",
	},
};

/** Builds a querystring that preserves the other filters while changing one. */
function hrefWith(params: { letter?: string; q?: string; page?: number }): string {
	const sp = new URLSearchParams();
	if (params.letter) sp.set("letter", params.letter);
	if (params.q) sp.set("q", params.q);
	if (params.page && params.page > 1) sp.set("page", String(params.page));
	const qs = sp.toString();
	return qs ? `/bible/people?${qs}` : "/bible/people";
}

export default async function PeopleIndexPage({ searchParams }: PageProps) {
	const { letter, q, page: pageParam } = await searchParams;
	const page = Number.parseInt(pageParam ?? "1", 10) || 1;

	const { rows, total, letters, pageSize } = await entityListForIndexSS({ letter, query: q, page });

	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
	const to = Math.min(page * pageSize, total);

	return (
		<div className="max-w-5xl mx-auto px-4 py-8">
			<div className="flex items-start gap-4 mb-6">
				<div className="rounded-full bg-primary/10 p-3 shrink-0">
					<Users className="h-7 w-7 text-primary" />
				</div>
				<div>
					<h1 className="text-3xl font-heading font-bold">Bible Characters</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Every person named in scripture, ordered by how often they appear.
					</p>
				</div>
			</div>

			{/* Search */}
			<form action="/bible/people" className="relative mb-4">
				<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					name="q"
					defaultValue={q ?? ""}
					placeholder="Search by name…"
					className="pl-9"
					aria-label="Search characters by name"
				/>
				{letter && <input type="hidden" name="letter" value={letter} />}
			</form>

			{/* A-Z filter */}
			<nav className="flex flex-wrap gap-1 mb-6" aria-label="Filter by first letter">
				<Link
					href={hrefWith({ q })}
					className={cn(
						"rounded px-2.5 py-1 text-sm hover:bg-muted",
						!letter && "bg-primary/10 font-semibold text-primary",
					)}
				>
					All
				</Link>
				{letters.map((l) => (
					<Link
						key={l}
						href={hrefWith({ letter: l, q })}
						className={cn(
							"rounded px-2.5 py-1 text-sm hover:bg-muted",
							letter?.toUpperCase() === l && "bg-primary/10 font-semibold text-primary",
						)}
					>
						{l}
					</Link>
				))}
			</nav>

			{rows.length === 0 ? (
				<p className="text-muted-foreground py-12 text-center">
					No characters match that search.
				</p>
			) : (
				<>
					<p className="text-sm text-muted-foreground mb-3">
						Showing {from}–{to} of {total}
					</p>

					<ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
						{rows.map((p) => (
							<li key={p.slug}>
								<Link
									href={`/bible/people/${p.slug}`}
									className="flex items-baseline justify-between gap-2 rounded px-2 py-1.5 hover:bg-muted"
								>
									<span
										className={cn(
											"truncate",
											p.mentionCount >= CHARACTER_INDEX_MIN_MENTIONS
												? "font-medium text-foreground"
												: "text-muted-foreground",
										)}
									>
										{p.name}
									</span>
									<span className="shrink-0 text-xs tabular-nums text-muted-foreground">
										{p.mentionCount}
									</span>
								</Link>
							</li>
						))}
					</ul>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="mt-8 flex items-center justify-between">
							<Button variant="outline" size="sm" asChild disabled={page <= 1}>
								<Link href={hrefWith({ letter, q, page: page - 1 })} aria-disabled={page <= 1}>
									Previous
								</Link>
							</Button>
							<span className="text-sm text-muted-foreground">
								Page {page} of {totalPages}
							</span>
							<Button variant="outline" size="sm" asChild disabled={page >= totalPages}>
								<Link href={hrefWith({ letter, q, page: page + 1 })} aria-disabled={page >= totalPages}>
									Next
								</Link>
							</Button>
						</div>
					)}
				</>
			)}

			<footer className="mt-10 pt-4 border-t text-xs text-muted-foreground">
				The number beside each name is how many verses mention them. Character data from{" "}
				<a
					href="https://github.com/robertrouse/theographic-bible-metadata"
					target="_blank"
					rel="noopener noreferrer"
					className="hover:underline"
				>
					theographic-bible-metadata
				</a>{" "}
				(CC-BY-SA 4.0).
			</footer>
		</div>
	);
}
