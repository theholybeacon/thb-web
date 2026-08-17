"use client";

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

/**
 * The whole picture of a user's reading, for people who never read in order.
 *
 * Everything comes from one server call — the aggregate is small enough (bounded
 * by the 1189-chapter canon) that splitting it into per-section queries would
 * add round trips without saving work.
 */
export default function JourneyPage() {
	const t = useTranslations("journey");
	const { user, loading } = useLoggedUserContext();
	const today = localDateString();

	const { data: stats, isLoading } = useQuery({
		queryKey: ["completionStats", today, user?.id ?? null],
		queryFn: () => completionStatsGetSS(today),
		enabled: Boolean(user?.id),
	});

	if (loading || (user?.id && isLoading)) {
		return (
			<AppShell>
				<div className="flex h-full items-center justify-center py-20">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			</AppShell>
		);
	}

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
							<JourneyHero stats={stats} />
							<TimeframeStrip stats={stats} />
							<ModeBreakdown stats={stats} />
							<BibleGrid books={stats.books} />
							<BadgeGrid badges={stats.badges} />
							<ShareJourney
								username={user.username}
								isPublic={Boolean(user.publicProfileEnabled)}
							/>
						</>
					)}
				</div>
			</div>
		</AppShell>
	);
}
