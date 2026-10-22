import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, BookOpen, ListPlus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatStepReference, stepKey } from "@/app/common/studyBuilder/model/draft";
import type { StudyBuilderDraft, StudyBuilderDraftStep } from "@/app/common/studyBuilder/model/StudyBuilder";

export const EMPTY_DRAFT: StudyBuilderDraft = { name: "", description: "", topic: "", length: 3, depth: 5, steps: [] };

type Props = {
	draft: StudyBuilderDraft | null;
	onChange: (draft: StudyBuilderDraft) => void;
	names: Map<string, string>;
	disabled?: boolean;
	/** The translation picker and the create / save button. */
	footer: ReactNode;
};

const SCALE = Array.from({ length: 10 }, (_, i) => i + 1);

/**
 * The plan, editable by hand: its name and scales, and its readings — retitle,
 * explain, reorder, remove. Readings come in from the passage finder.
 */
export function PlanEditor({ draft, onChange, names, disabled, footer }: Props) {
	const t = useTranslations("studyBuilder");
	const te = useTranslations("studyBuilder.editor");
	const plan = draft ?? EMPTY_DRAFT;
	const [editing, setEditing] = useState<number | null>(null);

	const set = (patch: Partial<StudyBuilderDraft>) => onChange({ ...plan, ...patch });
	const setStep = (i: number, patch: Partial<StudyBuilderDraftStep>) =>
		set({ steps: plan.steps.map((s, n) => (n === i ? { ...s, ...patch } : s)) });
	const move = (i: number, by: number) => {
		const steps = [...plan.steps];
		const [step] = steps.splice(i, 1);
		steps.splice(i + by, 0, step);
		set({ steps });
		if (editing === i) setEditing(i + by);
	};
	const remove = (i: number) => {
		set({ steps: plan.steps.filter((_, n) => n !== i) });
		setEditing(null);
	};

	// Stable keys, so only a reading that was just added animates in.
	const seen = new Map<string, number>();
	const keys = plan.steps.map((s) => {
		const k = stepKey(s);
		const n = (seen.get(k) ?? 0) + 1;
		seen.set(k, n);
		return `${k}#${n}`;
	});

	return (
		<div className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm" data-testid="builder-editor">
			<div className="space-y-3 border-b bg-gradient-to-br from-primary/10 to-transparent p-5">
				<p className="text-xs font-medium uppercase tracking-wider text-primary">{t("planLabel")}</p>
				<Input
					value={plan.name}
					onChange={(e) => set({ name: e.target.value })}
					placeholder={te("namePlaceholder")}
					aria-label={te("name")}
					disabled={disabled}
					className="h-auto border-transparent bg-transparent px-0 text-xl font-bold shadow-none hover:border-border focus-visible:border-input focus-visible:bg-background focus-visible:px-2"
				/>
				<Textarea
					value={plan.description}
					onChange={(e) => set({ description: e.target.value })}
					placeholder={te("descriptionPlaceholder")}
					aria-label={te("description")}
					disabled={disabled}
					rows={2}
					className="min-h-0 resize-none bg-background/60 text-sm"
				/>
				<Input
					value={plan.topic}
					onChange={(e) => set({ topic: e.target.value })}
					placeholder={te("topicPlaceholder")}
					aria-label={te("topic")}
					disabled={disabled}
					className="bg-background/60 text-sm"
				/>
				<div className="flex flex-wrap items-center gap-2 text-xs">
					<Select value={String(plan.length)} onValueChange={(v) => set({ length: Number(v) })} disabled={disabled}>
						<SelectTrigger className="h-8 w-auto gap-1 rounded-full bg-background text-xs" aria-label={te("length")}>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{SCALE.map((n) => <SelectItem key={n} value={String(n)}>{t(`lengths.${n}`)}</SelectItem>)}
						</SelectContent>
					</Select>
					<Select value={String(plan.depth)} onValueChange={(v) => set({ depth: Number(v) })} disabled={disabled}>
						<SelectTrigger className="h-8 w-auto gap-1 rounded-full bg-background text-xs" aria-label={te("depth")}>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{SCALE.map((n) => <SelectItem key={n} value={String(n)}>{t("depthValue", { depth: n })}</SelectItem>)}
						</SelectContent>
					</Select>
					<span className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1.5 shadow-sm" data-testid="builder-plan-count">
						<BookOpen className="h-3 w-3" /> {t("readings", { count: plan.steps.length })}
					</span>
				</div>
			</div>

			{plan.steps.length === 0 ? (
				<div className="flex flex-1 flex-col items-center justify-center p-8 text-center" data-testid="builder-editor-empty">
					<div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
						<ListPlus className="h-5 w-5 text-primary" />
					</div>
					<p className="font-medium">{te("emptyTitle")}</p>
					<p className="mt-1 max-w-xs text-sm text-muted-foreground">{te("emptyHint")}</p>
				</div>
			) : (
				<ol className="flex-1 space-y-2 overflow-y-auto p-4">
					{plan.steps.map((step, i) => {
						const reference = formatStepReference(step, names);
						const open = editing === i;
						return (
							<li
								key={keys[i]}
								className={cn("group rounded-xl border bg-background p-3 animate-in fade-in slide-in-from-left-4 duration-300", open && "ring-2 ring-primary/30")}
								data-testid="builder-plan-step"
							>
								<div className="flex items-start gap-3">
									<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{i + 1}</span>
									<div className="min-w-0 flex-1">
										<p className="text-sm font-medium leading-snug">{step.title}</p>
										<p className="text-xs text-primary">{reference}</p>
										{!open && step.explanation && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{step.explanation}</p>}
									</div>
									<div className="flex shrink-0 gap-0.5 opacity-60 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
										<Button variant="ghost" size="icon" className="h-7 w-7" disabled={disabled || i === 0} onClick={() => move(i, -1)} aria-label={te("moveUp")} title={te("moveUp")}>
											<ArrowUp className="h-3.5 w-3.5" />
										</Button>
										<Button variant="ghost" size="icon" className="h-7 w-7" disabled={disabled || i === plan.steps.length - 1} onClick={() => move(i, 1)} aria-label={te("moveDown")} title={te("moveDown")}>
											<ArrowDown className="h-3.5 w-3.5" />
										</Button>
										<Button variant="ghost" size="icon" className={cn("h-7 w-7", open && "bg-primary/10 text-primary")} disabled={disabled} onClick={() => setEditing(open ? null : i)} aria-label={te("edit")} title={te("edit")}>
											<Pencil className="h-3.5 w-3.5" />
										</Button>
										<Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" disabled={disabled} onClick={() => remove(i)} aria-label={te("remove", { reference })} title={te("remove", { reference })}>
											<Trash2 className="h-3.5 w-3.5" />
										</Button>
									</div>
								</div>
								{open && (
									<div className="mt-3 space-y-2 pl-9 animate-in fade-in slide-in-from-top-1">
										<Input value={step.title} onChange={(e) => setStep(i, { title: e.target.value })} aria-label={te("stepTitle")} placeholder={te("stepTitle")} className="h-8 text-sm" autoFocus />
										<Textarea value={step.explanation} onChange={(e) => setStep(i, { explanation: e.target.value })} aria-label={te("stepExplanation")} placeholder={te("stepExplanation")} rows={3} className="text-sm" />
										<div className="flex justify-end">
											<Button size="sm" variant="secondary" onClick={() => setEditing(null)}>{te("done")}</Button>
										</div>
									</div>
								)}
							</li>
						);
					})}
				</ol>
			)}

			<div className="space-y-3 border-t p-4">{footer}</div>
		</div>
	);
}
