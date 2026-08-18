"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ChevronRight, Trophy } from "lucide-react";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { completionStatsGetSS } from "@/app/common/completion/service/server/completionStatsGetSS";
import { localDateString } from "@/lib/activityClient";
import { useJourneyScope } from "@/lib/journeyScope";

/**
 * A one-line read on how far through the Bible the user is, on the home page.
 *
 * The point of surfacing it here is that progress is invisible by design in this
 * app — you start wherever you need — so it has to be shown somewhere the user
 * already goes, not only on a page they have to remember to visit.
 *
 * Follows the zoom level chosen on /journey, and shares its query key, so the
 * card and the page always agree and the second of the two to render is a cache
 * hit rather than another round trip.
 */
export function JourneyHomeCard() {
	const t = useTranslations("journey");
	const { user } = useLoggedUserContext();
	const today = localDateString();
	const { scope, ready } = useJourneyScope();

	const { data: stats } = useQuery({
		queryKey: ["completionStats", today, user?.id ?? null, scope],
		queryFn: () => completionStatsGetSS(today, scope),
		enabled: Boolean(user?.id) && ready,
	});

	if (!stats) return null;

	return (
		<Link href="/journey" className="group block">
			<div className="rounded-lg border bg-card p-5 transition-all hover:border-primary hover:shadow-md">
				<div className="flex items-center gap-4">
					<div className="rounded-full bg-primary/10 p-3">
						<Trophy className="h-5 w-5 text-primary" />
					</div>

					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-baseline gap-x-2">
							<p className="font-heading text-lg font-semibold leading-none">{stats.percent}%</p>
							<p className="text-sm text-muted-foreground">
								{t("chaptersComplete", {
									done: stats.completedChapters,
									total: stats.totalChapters,
								})}
							</p>
						</div>

						{/* Same bar idiom as the sidebar's session progress. */}
						<div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
							<div
								className="h-full rounded-full bg-primary transition-[width] duration-700"
								style={{ width: `${Math.max(stats.percent, stats.percent > 0 ? 1 : 0)}%` }}
							/>
						</div>

						<p className="mt-2 text-xs text-muted-foreground">
							{stats.scope.label && `${stats.scope.label} · `}
							{stats.timeframe.week > 0
								? `${stats.timeframe.week} ${t("chaptersShort")} · ${t("week")}`
								: t("title")}
						</p>
					</div>

					<ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
				</div>
			</div>
		</Link>
	);
}
