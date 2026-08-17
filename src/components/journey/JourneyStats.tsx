"use client";

import { useTranslations } from "next-intl";
import { Flame, Headphones, Keyboard, Eye, Check } from "lucide-react";
import { CompletionStats, CompletionMode } from "@/app/common/completion/model/Completion";
import { ProgressRing } from "./ProgressRing";
import { cn } from "@/lib/utils";

/** Hours + minutes, dropping the hours entirely below one. */
function formatDuration(seconds: number, hLabel: string, mLabel: string): string {
	if (seconds <= 0) return `0${mLabel}`;
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.round((seconds % 3600) / 60);
	if (hours === 0) return `${minutes}${mLabel}`;
	return `${hours}${hLabel} ${minutes}${mLabel}`;
}

export function JourneyHero({ stats }: { stats: CompletionStats }) {
	const t = useTranslations("journey");

	return (
		<div className="rounded-lg border bg-card p-5 sm:p-6">
			<div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
				<ProgressRing percent={stats.percent}>
					<span className="font-heading text-3xl font-bold leading-none">{stats.percent}%</span>
					<span className="mt-1 text-[11px] text-muted-foreground">{t("percentComplete")}</span>
				</ProgressRing>

				<div className="min-w-0 flex-1 text-center sm:text-left">
					<p className="font-heading text-xl font-semibold">
						{t("chaptersComplete", { done: stats.completedChapters, total: stats.totalChapters })}
					</p>

					{/*
					 * "Into the next pass" only means something once a full pass exists.
					 * Before that, chaptersTowardNextLap is just the completed count
					 * again, and showing it restates the number directly above.
					 */}
					<p className="mt-1 text-sm text-muted-foreground">
						{stats.laps > 0 ? t("lapsCount", { count: stats.laps }) : t("lapsNone")}
						{stats.laps > 0 && stats.chaptersTowardNextLap > 0 && (
							<> · {t("towardNextLap", { count: stats.chaptersTowardNextLap })}</>
						)}
					</p>

					<div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 sm:justify-start">
						<Stat label={t("oldTestament")} value={`${stats.otCompleted}/${stats.otChapters}`} />
						<Stat label={t("newTestament")} value={`${stats.ntCompleted}/${stats.ntChapters}`} />
						<Stat label={t("booksFinished")} value={String(stats.booksCompleted)} />
						<Stat label={t("booksUntouched")} value={String(stats.booksUntouched)} />
					</div>
				</div>

				<div className="flex shrink-0 items-center gap-3 rounded-lg border bg-background px-4 py-3">
					<div
						className={cn(
							"rounded-full p-2.5",
							stats.streak.todayDone ? "bg-orange-100 dark:bg-orange-900/30" : "bg-muted",
						)}
					>
						<Flame
							className={cn(
								"h-5 w-5",
								stats.streak.todayDone ? "text-orange-500" : "text-muted-foreground",
							)}
						/>
					</div>
					<div>
						<p className="text-xl font-bold leading-none">{stats.streak.current}</p>
						<p className="mt-1 text-[11px] text-muted-foreground">
							{t("today")} · {stats.streak.longest}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

function Stat({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<p className="font-heading text-lg font-semibold leading-none">{value}</p>
			<p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
		</div>
	);
}

export function TimeframeStrip({ stats }: { stats: CompletionStats }) {
	const t = useTranslations("journey");
	const frames: { key: keyof CompletionStats["timeframe"]; label: string }[] = [
		{ key: "today", label: t("today") },
		{ key: "week", label: t("week") },
		{ key: "month", label: t("month") },
		{ key: "year", label: t("year") },
	];

	return (
		<div className="rounded-lg border bg-card p-5">
			<h2 className="mb-4 font-heading text-lg font-semibold">{t("timeframeTitle")}</h2>
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
				{frames.map((frame) => (
					<div key={frame.key} className="rounded-lg border bg-background px-4 py-3 text-center">
						<p className="font-heading text-2xl font-bold leading-none">
							{stats.timeframe[frame.key]}
						</p>
						<p className="mt-1.5 text-[11px] text-muted-foreground">{frame.label}</p>
					</div>
				))}
			</div>
		</div>
	);
}

const MODE_ICONS: Record<CompletionMode, typeof Eye> = {
	read: Eye,
	listen: Headphones,
	type: Keyboard,
	manual: Check,
};

export function ModeBreakdown({ stats }: { stats: CompletionStats }) {
	const t = useTranslations("journey");
	const modes: { key: CompletionMode; label: string }[] = [
		{ key: "read", label: t("modeRead") },
		{ key: "listen", label: t("modeListen") },
		{ key: "type", label: t("modeType") },
		{ key: "manual", label: t("modeManual") },
	];

	return (
		<div className="rounded-lg border bg-card p-5">
			<div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
				<h2 className="font-heading text-lg font-semibold">{t("modesTitle")}</h2>
				{stats.byMode.listen.seconds > 0 && (
					<p className="text-xs text-muted-foreground">
						{t("listeningTime")}:{" "}
						<span className="font-medium text-foreground">
							{formatDuration(stats.byMode.listen.seconds, t("hoursShort"), t("minutesShort"))}
						</span>
					</p>
				)}
			</div>

			<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
				{modes.map((mode) => {
					const Icon = MODE_ICONS[mode.key];
					return (
						<div
							key={mode.key}
							className="flex items-center gap-3 rounded-lg border bg-background px-4 py-3"
						>
							<Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
							<div className="min-w-0">
								<p className="font-heading text-xl font-semibold leading-none">
									{stats.byMode[mode.key].chapters}
								</p>
								<p className="mt-1 truncate text-[11px] text-muted-foreground">{mode.label}</p>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
