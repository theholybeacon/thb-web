"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Check, Eye, Headphones, Keyboard, Mic, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShareStoryButton } from "@/components/share/ShareStoryButton";
import type { SessionSummary } from "@/app/common/session/model/SessionSummary";
import type { StudyMode } from "@/app/common/sessionStepCompletion/model/SessionStepCompletion";
import { cn } from "@/lib/utils";

/** Shared with the session footer's mode chips so the recap reads the same way. */
export function ModeIcon({ mode, className }: { mode: StudyMode; className?: string }) {
	const cls = cn("h-3 w-3", className);
	switch (mode) {
		case "read":
			return <Eye className={cls} />;
		case "type":
			return <Keyboard className={cls} />;
		case "listen":
			return <Headphones className={cls} />;
		case "dictation":
			return <Mic className={cls} />;
		default:
			return null;
	}
}

/** Literal keys so next-intl can type-check them; a template key cannot be. */
const MODE_LABEL_KEY: Record<StudyMode, string> = {
	read: "complete.mode_read",
	type: "complete.mode_type",
	listen: "complete.mode_listen",
	dictation: "complete.mode_dictation",
};

function formatDuration(seconds: number, hLabel: string, mLabel: string): string {
	if (seconds <= 0) return `0${mLabel}`;
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.round((seconds % 3600) / 60);
	if (hours === 0) return `${minutes}${mLabel}`;
	return `${hours}${hLabel} ${minutes}${mLabel}`;
}

/**
 * What a finished study session actually covered, offered at the moment it ends.
 *
 * Until now finishing navigated straight back to the sessions list, so the work
 * simply vanished. A recap is the natural place to offer a share: it is the one
 * moment someone has just done the thing and might want to say so.
 */
export function SessionCompleteDialog({
	summary,
	open,
	onClose,
}: {
	summary: SessionSummary | null;
	open: boolean;
	onClose: () => void;
}) {
	const t = useTranslations("session");
	const tj = useTranslations("journey");

	if (!summary) return null;

	const usedModes = (Object.keys(summary.modeTotals) as StudyMode[]).filter(
		(m) => summary.modeTotals[m].steps > 0,
	);

	return (
		<Dialog open={open} onOpenChange={(next) => !next && onClose()}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Trophy className="h-5 w-5 text-primary" />
						{t("complete.title")}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-5">
					<div>
						<p className="font-heading text-lg font-semibold">{summary.studyName}</p>
						{summary.bible && (
							<p className="mt-0.5 text-xs text-muted-foreground">{summary.bible.label}</p>
						)}
					</div>

					<div className="grid grid-cols-3 gap-3">
						<Metric
							value={`${summary.stepsCompleted}/${summary.totalSteps}`}
							label={t("complete.steps")}
						/>
						<Metric value={String(summary.chaptersStudied)} label={t("complete.chapters")} />
						<Metric
							value={formatDuration(summary.totalSeconds, tj("hoursShort"), tj("minutesShort"))}
							label={t("complete.engaged")}
						/>
					</div>

					<div className="space-y-1.5">
						{summary.steps.map((step) => (
							<div
								key={step.stepId}
								className={cn(
									"flex items-center gap-2.5 rounded-md border px-3 py-2",
									step.modes.length > 0 ? "border-primary/30 bg-primary/5" : "opacity-60",
								)}
							>
								{step.modes.length > 0 ? (
									<Check className="h-3.5 w-3.5 shrink-0 text-primary" />
								) : (
									<span className="h-3.5 w-3.5 shrink-0" />
								)}
								<span className="min-w-0 flex-1 truncate text-sm font-medium">
									{step.reference}
								</span>
								<span className="flex shrink-0 items-center gap-1 text-muted-foreground">
									{step.modes.map((mode) => (
										<ModeIcon key={mode} mode={mode} />
									))}
								</span>
							</div>
						))}
					</div>

					{usedModes.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{usedModes.map((mode) => (
								<span
									key={mode}
									className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary"
								>
									<ModeIcon mode={mode} />
									{`${summary.modeTotals[mode].steps} ${t(MODE_LABEL_KEY[mode] as never)}`}
								</span>
							))}
						</div>
					)}

					<div className="flex flex-wrap items-center gap-2 border-t pt-4">
						<ShareStoryButton kind="session" sessionId={summary.sessionId} />
						<Button asChild variant="ghost" size="sm">
							<Link href="/journey">{tj("title")}</Link>
						</Button>
						<Button asChild size="sm" className="ml-auto">
							<Link href="/session">{t("complete.done")}</Link>
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function Metric({ value, label }: { value: string; label: string }) {
	return (
		<div className="rounded-lg border bg-background px-3 py-2.5 text-center">
			<p className="font-heading text-lg font-bold leading-none">{value}</p>
			<p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
		</div>
	);
}
