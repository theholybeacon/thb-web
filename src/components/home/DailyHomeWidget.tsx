"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Flame, BookOpen, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { streakGetSS } from "@/app/common/activity/service/server/streakGetSS";
import { recordDailyActivitySS } from "@/app/common/activity/service/server/recordDailyActivitySS";
import { dailyVerseGetSS } from "@/app/common/dailyVerse/service/server/dailyVerseGetSS";
import { localDateString } from "@/lib/activityClient";
import { JourneyHomeCard } from "@/components/journey/JourneyHomeCard";

/** Streak counter + verse-of-the-day, the daily reason to open the app. */
export function DailyHomeWidget() {
	const { user } = useLoggedUserContext();
	const today = localDateString();
	const queryClient = useQueryClient();
	const [marking, setMarking] = useState(false);

	const { data: streak } = useQuery({
		queryKey: ["streak", today],
		queryFn: () => streakGetSS(today),
		enabled: Boolean(user?.id),
	});

	const { data: verse } = useQuery({
		queryKey: ["dailyVerse", today, user?.defaultBibleId ?? null],
		queryFn: () => dailyVerseGetSS(today, user?.defaultBibleId ?? undefined),
		enabled: Boolean(user?.id),
	});

	const current = streak?.current ?? 0;
	const todayDone = streak?.todayDone ?? false;

	const markRead = async () => {
		if (marking) return;
		setMarking(true);
		try {
			const res = await recordDailyActivitySS(today, "verse");
			if (res.ok) {
				if (typeof window !== "undefined") localStorage.setItem("thb_activity_date", today);
				await queryClient.invalidateQueries({ queryKey: ["streak", today] });
			}
		} finally {
			setMarking(false);
		}
	};

	return (
		<div className="space-y-4">
		<div className="grid gap-4 sm:grid-cols-3">
			{/* Streak */}
			<div className="rounded-lg border bg-card p-5 flex items-center gap-3">
				<div className={cn("rounded-full p-3", todayDone ? "bg-orange-100 dark:bg-orange-900/30" : "bg-muted")}>
					<Flame className={cn("h-6 w-6", todayDone ? "text-orange-500" : "text-muted-foreground")} />
				</div>
				<div>
					<p className="text-2xl font-bold leading-none">{current}</p>
					<p className="text-xs text-muted-foreground mt-1">day streak</p>
					<p className="text-xs mt-1">
						{todayDone ? (
							<span className="text-green-600 inline-flex items-center gap-1">
								<Check className="h-3 w-3" /> Done today
							</span>
						) : (
							<span className="text-muted-foreground">Read today to keep it going</span>
						)}
					</p>
					{streak?.longest ? (
						<p className="text-[11px] text-muted-foreground mt-1">Best: {streak.longest}</p>
					) : null}
				</div>
			</div>

			{/* Verse of the day */}
			<div className="rounded-lg border bg-card p-5 sm:col-span-2">
				<div className="flex items-center gap-2 text-xs font-medium text-primary mb-2">
					<BookOpen className="h-4 w-4" /> Verse of the day
				</div>
				{verse ? (
					<>
						<p className="text-sm leading-relaxed text-foreground">{verse.text}</p>
						<p className="text-xs text-muted-foreground mt-1">{verse.reference}</p>
						<div className="flex gap-2 mt-3">
							<Button
								size="sm"
								onClick={markRead}
								disabled={marking || todayDone}
								variant={todayDone ? "outline" : "default"}
							>
								{todayDone ? "Read ✓" : "Mark as read"}
							</Button>
							{verse.bibleSlug && verse.bookSlug && (
								<Link href={`/bible/${verse.bibleSlug}/${verse.bookSlug}/${verse.chapter}#verse-${verse.verse}`}>
									<Button size="sm" variant="ghost">
										Open in reader
									</Button>
								</Link>
							)}
						</div>
					</>
				) : (
					<p className="text-sm text-muted-foreground">Today&apos;s verse is loading…</p>
				)}
			</div>
		</div>

		{/* How far through the Bible they are — invisible by design everywhere else. */}
		<JourneyHomeCard />
		</div>
	);
}
