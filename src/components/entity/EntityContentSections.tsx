import Link from "next/link";
import type { EntityContent } from "@/app/common/entity/model/EntityContent";
import type { CommunityData } from "@/app/common/community/model/Community";
import { AiContent } from "./AiContent";
import { CitationLinks, RefLinkMap } from "./CitationLinks";
import { SectionCommunity } from "@/components/community/SectionCommunity";

/**
 * Server-rendered (SEO) AI sections for a character — overview, life timeline,
 * relationships (linked to other character pages), and significance — each
 * followed by its community strip. Renders nothing until content is ready
 * (the general community panel on the page covers the pre-generation case).
 */
export function EntityContentSections({
	content,
	linkMap,
	community,
	isPremium,
	entityId,
}: {
	content: EntityContent | null;
	linkMap: RefLinkMap;
	community: CommunityData;
	isPremium: boolean;
	entityId: string;
}) {
	if (!content || content.generationStatus !== "ready") return null;

	return (
		<div className="space-y-6 mb-8">
			{/* Overview */}
			<div>
				{content.overview && (
					<AiContent title="Overview" entityContentId={content.id} section="overview">
						<p className="text-sm leading-relaxed text-foreground">
							{content.overview}
							<CitationLinks refs={content.overviewRefs} linkMap={linkMap} />
						</p>
					</AiContent>
				)}
				<SectionCommunity
					entityId={entityId}
					section="overview"
					contributions={community.overview}
					linkMap={linkMap}
					isPremium={isPremium}
				/>
			</div>

			{/* Life timeline */}
			<div>
				{content.timeline.length > 0 && (
					<AiContent title="Life timeline" entityContentId={content.id} section="timeline">
						<ol className="space-y-3">
							{content.timeline.map((e, i) => (
								<li key={i} className="border-l-2 border-primary/20 pl-3">
									<p className="text-sm font-medium text-foreground">{e.title}</p>
									<p className="text-sm text-muted-foreground">
										{e.description}
										<CitationLinks refs={e.refs} linkMap={linkMap} />
									</p>
								</li>
							))}
						</ol>
					</AiContent>
				)}
				<SectionCommunity
					entityId={entityId}
					section="timeline"
					contributions={community.timeline}
					linkMap={linkMap}
					isPremium={isPremium}
				/>
			</div>

			{/* Relationships */}
			<div>
				{content.relationships.length > 0 && (
					<AiContent title="Relationships" entityContentId={content.id} section="relationships">
						<ul className="space-y-1.5">
							{content.relationships.map((r, i) => (
								<li key={i} className="text-sm">
									<span className="text-muted-foreground capitalize">{r.relation || "related"}: </span>
									{r.entitySlug ? (
										<Link href={`/bible/people/${r.entitySlug}`} className="text-primary hover:underline">
											{r.name}
										</Link>
									) : (
										<span className="text-foreground">{r.name}</span>
									)}
									<CitationLinks refs={r.refs} linkMap={linkMap} />
								</li>
							))}
						</ul>
					</AiContent>
				)}
				<SectionCommunity
					entityId={entityId}
					section="relationships"
					contributions={community.relationships}
					linkMap={linkMap}
					isPremium={isPremium}
				/>
			</div>

			{/* Significance */}
			<div>
				{content.significance && (
					<AiContent title="Significance" entityContentId={content.id} section="significance">
						<p className="text-sm leading-relaxed text-foreground">
							{content.significance}
							<CitationLinks refs={content.significanceRefs} linkMap={linkMap} />
						</p>
					</AiContent>
				)}
				<SectionCommunity
					entityId={entityId}
					section="significance"
					contributions={community.significance}
					linkMap={linkMap}
					isPremium={isPremium}
				/>
			</div>
		</div>
	);
}
