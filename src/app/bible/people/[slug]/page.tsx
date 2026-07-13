import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { User, BookOpen } from "lucide-react";
import { entityGetBySlugSS } from "@/app/common/entity/service/server/entityGetBySlugSS";
import { entityGetReferencesSS } from "@/app/common/entity/service/server/entityGetReferencesSS";
import { entityContentGetSS } from "@/app/common/entity/service/server/entityContentGetSS";
import { communityListSS } from "@/app/common/community/service/server/communityListSS";
import { isPremiumUserSS } from "@/app/common/subscription/service/server/isPremiumUserSS";
import { EntityContentSections } from "@/components/entity/EntityContentSections";
import { EntityContentLoader } from "@/components/entity/EntityContentLoader";
import { SectionCommunity } from "@/components/community/SectionCommunity";
import type { RefLinkMap } from "@/components/entity/CitationLinks";

type PageProps = { params: Promise<{ slug: string }> };

function yearLabel(y: number | null): string | null {
	if (y == null) return null;
	return y < 0 ? `${Math.abs(y)} BC` : `${y} AD`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const entity = await entityGetBySlugSS(slug);
	if (!entity) return { title: "Character Not Found | The Holy Beacon" };

	const aliases = (entity.aliases as string[] | null) ?? [];
	const description =
		`Who was ${entity.name} in the Bible? Scripture references` +
		(aliases.length ? `, also called ${aliases.join(", ")}` : "") +
		`, and more — on The Holy Beacon.`;

	return {
		title: `${entity.name} — Bible Character | The Holy Beacon`,
		description,
		openGraph: { title: `${entity.name} — Bible Character`, description, type: "profile", siteName: "The Holy Beacon" },
		alternates: { canonical: `/bible/people/${slug}` },
	};
}

export default async function CharacterPage({ params }: PageProps) {
	const { slug } = await params;
	const entity = await entityGetBySlugSS(slug);
	if (!entity) notFound();

	const references = await entityGetReferencesSS(entity.id);
	const content = await entityContentGetSS(entity.id);
	const community = await communityListSS(entity.id);
	const isPremium = await isPremiumUserSS();
	const aliases = (entity.aliases as string[] | null) ?? [];
	const birth = yearLabel(entity.birthYear);
	const death = yearLabel(entity.deathYear);

	// Map bookAbbreviation → reader link parts, for resolving AI citations.
	const linkMap: RefLinkMap = {};
	if (references.bibleSlug) {
		for (const g of references.groups) {
			linkMap[g.bookAbbreviation] = { bibleSlug: references.bibleSlug, bookSlug: g.bookSlug };
		}
	}

	return (
		<div className="max-w-3xl mx-auto px-4 py-8">
			{/* Header */}
			<div className="flex items-start gap-4 mb-6">
				<div className="rounded-full bg-primary/10 p-3 shrink-0">
					<User className="h-7 w-7 text-primary" />
				</div>
				<div>
					<h1 className="text-3xl font-heading font-bold">{entity.name}</h1>
					{aliases.length > 0 && (
						<p className="text-sm text-muted-foreground mt-1">Also called: {aliases.join(", ")}</p>
					)}
					<div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground mt-1">
						{entity.gender && <span>{entity.gender}</span>}
						{(birth || death) && <span>{birth ?? "?"} – {death ?? "?"}</span>}
					</div>
				</div>
			</div>

			{/* AI-generated content + per-section community (Phase A2/A3) */}
			<EntityContentSections
				content={content}
				linkMap={linkMap}
				community={community}
				isPremium={isPremium}
				entityId={entity.id}
			/>
			<EntityContentLoader entityId={entity.id} initialStatus={content?.generationStatus ?? "pending"} />

			{/* Scripture references (deterministic) */}
			<section>
				<div className="flex items-center gap-2 mb-3">
					<BookOpen className="h-5 w-5 text-primary" />
					<h2 className="text-xl font-heading font-semibold">
						Scripture references
						<span className="text-muted-foreground font-normal text-base ml-2">({references.totalMentions})</span>
					</h2>
				</div>

				{references.groups.length === 0 || !references.bibleSlug ? (
					<p className="text-muted-foreground">No references available yet.</p>
				) : (
					<div className="space-y-4">
						{references.groups.map((g) => (
							<div key={g.bookAbbreviation}>
								<h3 className="font-semibold mb-1">{g.bookName}</h3>
								<div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
									{g.chapters.flatMap((c) =>
										c.verses.map((v) => (
											<Link
												key={`${c.chapter}-${v}`}
												href={`/bible/${references.bibleSlug}/${g.bookSlug}/${c.chapter}#verse-${v}`}
												className="text-primary hover:underline"
											>
												{c.chapter}:{v}
											</Link>
										)),
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</section>

			{/* General community discussion (always available, even before AI content) */}
			<section className="mt-8">
				<h2 className="text-xl font-heading font-semibold mb-2">Community</h2>
				<SectionCommunity
					entityId={entity.id}
					section="general"
					contributions={community.general}
					linkMap={linkMap}
					isPremium={isPremium}
					defaultOpen
				/>
			</section>

			{/* Attribution */}
			<footer className="mt-10 pt-4 border-t text-xs text-muted-foreground">
				Character data from{" "}
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
