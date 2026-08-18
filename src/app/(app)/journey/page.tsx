"use client";

import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/app";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { completionStatsGetSS } from "@/app/common/completion/service/server/completionStatsGetSS";
import { localDateString } from "@/lib/activityClient";
import { JourneyHero, TimeframeStrip, ModeBreakdown } from "@/components/journey/JourneyStats";
import { BibleGrid } from "@/components/journey/BibleGrid";
import { BadgeGrid } from "@/components/journey/BadgeGrid";
import { ShareJourney } from "@/components/journey/ShareJourney";
import { JourneyScopeSwitcher } from "@/components/journey/JourneyScopeSwitcher";
import { useJourneyScope } from "@/lib/journeyScope";

/**
 * The whole picture of a user's reading, for people who never read in order.
 *
 * Everything comes from one server call — the aggregate is small enough (bounded
 * by the 1189-chapter canon) that splitting it into per-section queries would
 * add round trips without saving work.
 *
 * The zoom level is part of the query key, so switching between All Bibles and a
 * single translation is a cache lookup after the first visit rather than a
 * refetch, and the two views can be flipped between freely.
 *
 * Suspense is required, not stylistic: useJourneyScope reads useSearchParams,
 * and a page that does so without a Suspense boundary fails the production build.
 */
export default function JourneyPage() {
	return (
		<Suspense fallback={<JourneyLoading />}>
			<JourneyContent />
		</Suspense>
	);
}

function JourneyLoading() {
	return (
		<AppShell>
			<div className="flex h-full items-center justify-center py-20">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		</AppShell>
	);
}

function JourneyContent() {
	const t = useTranslations("journey");
	const { user, loading } = useLoggedUserContext();
	const today = localDateString();
	const { scope, setScope, ready } = useJourneyScope();

	const { data: stats, isLoading } = useQuery({
		queryKey: ["completionStats", today, user?.id ?? null, scope],
		queryFn: () => completionStatsGetSS(today, scope),
		// Held until the stored scope has been read, so the first paint isn't the
		// All Bibles view flashing before the user's actual choice loads.
		enabled: Boolean(user?.id) && ready,
	});

	if (loading || (user?.id && isLoading)) return <JourneyLoading />;

	if (!user?.id) {
		return (
			<AppShell>
				<div className="p-6 lg:p-8">
					<h1 className="font-heading text-3xl font-bold">{t("title")}</h1>
					<p className="mt-2 text-muted-foreground">{t("signedOut")}</p>
				</div>
			</AppShell>
		);
	}

	return (
		<AppShell>
			<div className="p-6 lg:p-8">
				<div className="mx-auto max-w-5xl space-y-6">
					<div>
						<h1 className="font-heading text-3xl font-bold">{t("title")}</h1>
						<p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
					</div>

					{stats && (
						<>
							<JourneyScopeSwitcher
								options={stats.scopeOptions}
								value={scope}
								onChange={setScope}
							/>
							<JourneyHero stats={stats} />
							<TimeframeStrip stats={stats} />
							<ModeBreakdown stats={stats} />
							<BibleGrid books={stats.books} />
							<BadgeGrid badges={stats.badges} scope={stats.scope} />
							<ShareJourney
								username={user.username}
								isPublic={Boolean(user.publicProfileEnabled)}
								scope={stats.scope.slug}
							/>
						</>
					)}
				</div>
			</div>
		</AppShell>
	);
}
