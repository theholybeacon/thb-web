import Link from "next/link";
import type { ContentRef } from "@/app/common/entity/model/EntityContent";

export type RefLinkMap = Record<string, { bibleSlug: string; bookSlug: string }>;

/** Renders canonical citation refs as compact links into the reader. */
export function CitationLinks({ refs, linkMap }: { refs: ContentRef[]; linkMap: RefLinkMap }) {
	if (!refs || refs.length === 0) return null;
	return (
		<span className="ml-1 inline-flex flex-wrap gap-1 align-baseline">
			{refs.map((r, i) => {
				const lm = linkMap[r.bookAbbreviation];
				const label = `${r.bookAbbreviation} ${r.chapter}:${r.verse}`;
				return lm ? (
					<Link
						key={i}
						href={`/bible/${lm.bibleSlug}/${lm.bookSlug}/${r.chapter}#verse-${r.verse}`}
						className="text-xs text-primary/70 hover:underline"
					>
						[{label}]
					</Link>
				) : (
					<span key={i} className="text-xs text-muted-foreground">
						[{label}]
					</span>
				);
			})}
		</span>
	);
}
