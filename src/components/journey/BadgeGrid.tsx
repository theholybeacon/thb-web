"use client";

import { useTranslations, useFormatter } from "next-intl";
import { Award, Lock } from "lucide-react";
import { badgesForZoom } from "@/app/common/completion/model/badges";
import { EarnedBadge, JourneyScope } from "@/app/common/completion/model/Completion";
import { cn } from "@/lib/utils";

/**
 * Every milestone, earned and not.
 *
 * Locked ones are shown deliberately: the next milestone is the reason to come
 * back, and hiding it would turn a map into a scoreboard. Ordered by `tier` so
 * the list reads as a path rather than an inventory.
 *
 * Zoomed into one translation the streak milestones disappear entirely rather
 * than sitting there permanently locked: a streak counts days shown up, not which
 * Bible was open, so there is no way to earn them at this level and showing them
 * would promise something unreachable.
 */
export function BadgeGrid({ badges, scope }: { badges: EarnedBadge[]; scope?: JourneyScope }) {
	const t = useTranslations("journey");
	const format = useFormatter();
	const earned = new Map(badges.map((b) => [b.key, b.earnedAt]));
	const scopeLabel = scope?.label ?? null;

	return (
		<div className="rounded-lg border bg-card p-5">
			<div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
				<h2 className="font-heading text-lg font-semibold">{t("badgesTitle")}</h2>
				{scopeLabel && (
					<p className="text-xs text-muted-foreground">{t("scopeIn", { bible: scopeLabel })}</p>
				)}
			</div>

			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
				{[...badgesForZoom(scopeLabel ? "bible" : "global")]
					.sort((a, b) => a.tier - b.tier)
					.map((badge) => {
						const isEarned = earned.has(badge.key);
						const earnedAt = earned.get(badge.key) ?? null;

						return (
							<div
								key={badge.key}
								className={cn(
									"flex items-start gap-2.5 rounded-lg border px-3 py-2.5",
									isEarned ? "border-primary/30 bg-primary/5" : "bg-background opacity-60",
								)}
							>
								{isEarned ? (
									<Award className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
								) : (
									<Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
								)}
								<div className="min-w-0">
									<p className="text-xs font-medium leading-tight">
										{t(`badges.${badge.key}` as never)}
									</p>
									{/*
									 * An earned badge with no stored date (earned before the row
									 * was written, or recomputed from live stats) shows nothing
									 * rather than an empty line.
									 */}
									{(!isEarned || earnedAt) && (
										<p className="mt-1 text-[11px] text-muted-foreground">
											{earnedAt
												? format.dateTime(new Date(earnedAt), {
														year: "numeric",
														month: "short",
														day: "numeric",
													})
												: t("badgeLocked")}
										</p>
									)}
								</div>
							</div>
						);
					})}
			</div>
		</div>
	);
}
