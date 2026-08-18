"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PublicCompletionStats } from "@/app/common/completion/model/Completion";
import { ProgressRing } from "./ProgressRing";
import { BibleGrid } from "./BibleGrid";
import { BadgeGrid } from "./BadgeGrid";
import { JourneyScopeSwitcher } from "./JourneyScopeSwitcher";
import { ShareStoryButton } from "@/components/share/ShareStoryButton";

function initials(name: string): string {
	return name
		.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

/**
 * Someone else's journey — the shareable view.
 *
 * Stands alone rather than inside AppShell: this is the page a link lands on,
 * usually for someone logged out, so it carries no app chrome and nothing that
 * assumes a session.
 *
 * The zoom level is the ROUTE here, not client state — a visitor has no stored
 * preference worth honouring, and Next passes only `params` to opengraph-image,
 * so a query string could never reach the share card that has to match the page.
 */
export function PublicJourney({ stats }: { stats: PublicCompletionStats }) {
	const t = useTranslations("journey");

	return (
		<div className="min-h-screen bg-background">
			<div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-16">
				<header className="mb-8 flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
					<Avatar className="h-20 w-20">
						<AvatarImage src={stats.profilePicture ?? undefined} alt={stats.name} />
						<AvatarFallback className="bg-primary/10 text-xl text-primary">
							{initials(stats.name || "?")}
						</AvatarFallback>
					</Avatar>

					<div className="min-w-0 flex-1">
						<h1 className="font-heading text-2xl font-bold sm:text-3xl">{stats.name}</h1>
						<p className="mt-1 text-muted-foreground">
							{t("profileSubtitle", { name: stats.name })}
							{stats.scope.label && ` · ${stats.scope.label}`}
						</p>
						<p className="mt-3 text-sm">
							<span className="font-medium">
								{t("chaptersComplete", {
									done: stats.completedChapters,
									total: stats.totalChapters,
								})}
							</span>
							{" · "}
							<span className="text-muted-foreground">
								{stats.laps > 0 ? t("lapsCount", { count: stats.laps }) : t("lapsNone")}
							</span>
						</p>
					</div>

					<ProgressRing percent={stats.percent} size={112} strokeWidth={9}>
						<span className="font-heading text-2xl font-bold leading-none">{stats.percent}%</span>
						<span className="mt-1 text-[10px] text-muted-foreground">{t("percentComplete")}</span>
					</ProgressRing>
				</header>

				<div className="mb-6 flex flex-wrap items-center justify-between gap-3">
					<JourneyScopeSwitcher
						options={stats.scopeOptions}
						value={stats.scope.slug}
						hrefFor={(slug) => (slug ? `/u/${stats.username}/${slug}` : `/u/${stats.username}`)}
					/>
					<ShareStoryButton
						kind="profile"
						username={stats.username}
						bible={stats.scope.slug}
					/>
				</div>

				<div className="space-y-6">
					<BibleGrid books={stats.books} />
					<BadgeGrid badges={stats.badges} scope={stats.scope} />
				</div>

				<footer className="mt-10 text-center">
					<Link href="/" className="text-sm text-muted-foreground hover:text-primary">
						The Holy Beacon
					</Link>
				</footer>
			</div>
		</div>
	);
}
