import { useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { BookOpen, Brain, CalendarDays, Compass, GraduationCap, MessageCircle, MessagesSquare, NotebookPen, X, HelpCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { canonBook } from "@/app/common/canon/model/canon";
import { studyBuilderMemoryForgetSS, studyBuilderMemoryListSS } from "@/app/common/studyBuilder/service/server/studyBuilderSS";
import type { LearnerHighlight, StudyBuilderMemoryFact } from "@/app/common/studyBuilder/model/StudyBuilder";

const ICONS: Record<LearnerHighlight["kind"], typeof BookOpen> = {
	start: Compass,
	reading: BookOpen,
	activity: CalendarDays,
	studies: GraduationCap,
	notes: NotebookPen,
	posts: HelpCircle,
	comments: MessageCircle,
	conversations: MessagesSquare,
	memory: Brain,
};

/**
 * "What I know about you": the sources the builder is drawing on, shown as
 * chips above the conversation, and the facts it remembers — each of which the
 * reader can make it forget.
 */
export function KnowledgeStrip({ highlights, remembered }: { highlights: LearnerHighlight[] | null; remembered: StudyBuilderMemoryFact[] }) {
	const t = useTranslations("studyBuilder");
	const queryClient = useQueryClient();
	const { data: memory } = useQuery({
		queryKey: ["studyBuilderMemory", remembered.length],
		queryFn: () => studyBuilderMemoryListSS(),
	});

	async function forget(fact: StudyBuilderMemoryFact) {
		await studyBuilderMemoryForgetSS(fact.id);
		await queryClient.invalidateQueries({ queryKey: ["studyBuilderMemory"] });
	}

	if (!highlights) {
		return <div className="h-7 w-2/3 animate-pulse rounded-full bg-muted" />;
	}

	return (
		<div className="flex flex-wrap items-center gap-1.5" data-testid="builder-knowledge">
			<span className="mr-1 text-xs font-medium text-muted-foreground">{t("drawingOn")}</span>
			{highlights.length === 0 && <span className="text-xs text-muted-foreground">{t("knowsNothingYet")}</span>}
			{highlights.filter((h) => h.kind !== "memory").map((h, i) => {
				const Icon = ICONS[h.kind];
				// Their answers from /welcome: open them again to change them.
				if (h.kind === "start") {
					return (
						<Link
							key={h.kind}
							href="/welcome?again=1"
							className="inline-flex items-center gap-1 rounded-full border bg-card px-2.5 py-1 text-xs transition-colors hover:border-primary/50 animate-in fade-in zoom-in-95 fill-mode-both"
							style={{ animationDelay: `${i * 80}ms` }}
							data-testid="builder-start-chip"
						>
							<Icon className="h-3 w-3 text-primary" />
							{t("highlights.start")}
						</Link>
					);
				}
				return (
					<span
						key={h.kind}
						className="inline-flex items-center gap-1 rounded-full border bg-card px-2.5 py-1 text-xs animate-in fade-in zoom-in-95 fill-mode-both"
						style={{ animationDelay: `${i * 80}ms` }}
					>
						<Icon className="h-3 w-3 text-primary" />
						{h.kind === "reading" && h.detail
							? t("highlights.reading", { count: h.count, book: canonBook(h.detail)?.englishName ?? h.detail })
							: t(h.kind === "reading" ? "highlights.readingPlain" : `highlights.${h.kind}`, { count: h.count })}
					</span>
				);
			})}
			<Popover>
				<PopoverTrigger asChild>
					<button
						type="button"
						className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-700 transition-colors hover:bg-amber-500/20 dark:text-amber-400"
						data-testid="builder-memory-button"
					>
						<Brain className="h-3 w-3" />
						{t("memoryButton", { count: memory?.length ?? 0 })}
					</button>
				</PopoverTrigger>
				<PopoverContent className="w-80" align="start">
					<p className="text-sm font-medium">{t("memoryTitle")}</p>
					<p className="mb-3 text-xs text-muted-foreground">{t("memoryHint")}</p>
					{!memory?.length ? (
						<p className="text-sm text-muted-foreground">{t("memoryEmpty")}</p>
					) : (
						<ul className="max-h-64 space-y-1.5 overflow-y-auto" data-testid="builder-memory-list">
							{memory.map((m) => (
								<li key={m.id} className="group flex items-start gap-2 rounded-md bg-muted/50 px-2 py-1.5 text-sm">
									<span className="flex-1">{m.fact}</span>
									<button type="button" onClick={() => forget(m)} className="text-muted-foreground opacity-60 hover:text-destructive group-hover:opacity-100" aria-label={t("forget")} title={t("forget")}>
										<X className="h-3.5 w-3.5" />
									</button>
								</li>
							))}
						</ul>
					)}
				</PopoverContent>
			</Popover>
		</div>
	);
}
