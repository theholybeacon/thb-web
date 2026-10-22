import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, BookOpen, Clock, Layers, Loader2, RefreshCw, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BibleSelector } from "@/components/app";
import { cn } from "@/lib/utils";
import { formatStepReference } from "@/app/common/studyBuilder/model/draft";
import type { StudyBuilderDraft } from "@/app/common/studyBuilder/model/StudyBuilder";
import type { Bible } from "@/app/common/bible/model/Bible";

type Props = {
	draft: StudyBuilderDraft | null;
	draftVersion: number;
	busy: boolean;
	bibles: Bible[] | undefined;
	biblesLoading: boolean;
	bibleId: string;
	onBibleChange: (id: string) => void;
	/** Sends a message to the builder on the reader's behalf ("Remove step 3…"). */
	onAsk: (message: string) => void;
	onCreate: () => void;
	creating: boolean;
	createdStudyId: string | null;
};

/**
 * The plan as it takes shape. It rebuilds with every turn that changes it; the
 * reader can also steer it from here — each step's actions are messages to the
 * builder, so every change still goes through the conversation.
 */
export function PlanPanel({ draft, draftVersion, busy, bibles, biblesLoading, bibleId, onBibleChange, onAsk, onCreate, creating, createdStudyId }: Props) {
	const t = useTranslations("studyBuilder");
	const [flash, setFlash] = useState(false);

	useEffect(() => {
		if (!draftVersion) return;
		setFlash(true);
		const timer = setTimeout(() => setFlash(false), 1200);
		return () => clearTimeout(timer);
	}, [draftVersion]);

	if (!draft) {
		return (
			<div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center" data-testid="builder-plan-empty">
				<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
					<Wand2 className="h-6 w-6 text-primary" />
				</div>
				<p className="font-medium">{t("planEmptyTitle")}</p>
				<p className="mt-1 max-w-xs text-sm text-muted-foreground">{t("planEmptyHint")}</p>
				<div className="mt-6 w-full max-w-xs space-y-2 opacity-60">
					{[0, 1, 2].map((i) => (
						<div key={i} className="h-10 animate-pulse rounded-lg bg-muted" style={{ animationDelay: `${i * 200}ms` }} />
					))}
				</div>
			</div>
		);
	}

	return (
		<div
			className={cn("flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow duration-700", flash && "ring-2 ring-primary/50 shadow-lg shadow-primary/10")}
			data-testid="builder-plan"
		>
			<div className="border-b bg-gradient-to-br from-primary/10 to-transparent p-5">
				<p className="text-xs font-medium uppercase tracking-wider text-primary">{t("planLabel")}</p>
				<h2 key={`name-${draftVersion}`} className="mt-1 text-xl font-bold animate-in fade-in duration-500" data-testid="builder-plan-name">{draft.name}</h2>
				{draft.description && <p className="mt-1 text-sm text-muted-foreground">{draft.description}</p>}
				<div className="mt-3 flex flex-wrap gap-2 text-xs">
					<span className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 shadow-sm">
						<Clock className="h-3 w-3" /> {t(`lengths.${draft.length}`)}
					</span>
					<span className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 shadow-sm">
						<Layers className="h-3 w-3" /> {t("depthValue", { depth: draft.depth })}
					</span>
					<span className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 shadow-sm" data-testid="builder-plan-count">
						<BookOpen className="h-3 w-3" /> {t("readings", { count: draft.steps.length })}
					</span>
				</div>
			</div>

			<ol className="flex-1 space-y-2 overflow-y-auto p-4">
				{draft.steps.map((step, i) => {
					const reference = formatStepReference(step);
					return (
						<li
							key={`${draftVersion}-${i}`}
							className="group rounded-xl border bg-background p-3 animate-in fade-in slide-in-from-right-4 fill-mode-both"
							style={{ animationDelay: `${Math.min(i, 12) * 60}ms`, animationDuration: "400ms" }}
							data-testid="builder-plan-step"
						>
							<div className="flex items-start gap-3">
								<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{i + 1}</span>
								<div className="min-w-0 flex-1">
									<p className="text-sm font-medium leading-snug">{step.title}</p>
									<p className="text-xs text-primary">{reference}</p>
									{step.explanation && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground group-hover:line-clamp-none">{step.explanation}</p>}
								</div>
								<div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
									<Button variant="ghost" size="icon" className="h-7 w-7" disabled={busy || !!createdStudyId} title={t("swapStep")} aria-label={t("swapStep")}
										onClick={() => onAsk(t("swapStepMessage", { n: i + 1, reference }))}>
										<RefreshCw className="h-3.5 w-3.5" />
									</Button>
									<Button variant="ghost" size="icon" className="h-7 w-7" disabled={busy || !!createdStudyId} title={t("removeStep")} aria-label={t("removeStep")}
										onClick={() => onAsk(t("removeStepMessage", { n: i + 1, reference }))}>
										<Trash2 className="h-3.5 w-3.5" />
									</Button>
								</div>
							</div>
						</li>
					);
				})}
			</ol>

			<div className="space-y-3 border-t p-4">
				{createdStudyId ? (
					<Button asChild className="w-full">
						<Link href={`/study/${createdStudyId}`}>{t("openStudy")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
					</Button>
				) : (
					<>
						<BibleSelector bibles={bibles} value={bibleId} onValueChange={onBibleChange} disabled={biblesLoading} isLoading={biblesLoading} />
						<Button className="w-full" size="lg" onClick={onCreate} disabled={creating || busy || !bibleId || draft.steps.length === 0}>
							{creating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("creating")}</> : t("create")}
						</Button>
					</>
				)}
			</div>
		</div>
	);
}
