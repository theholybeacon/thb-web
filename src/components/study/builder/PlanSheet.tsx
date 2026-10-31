
import { useEffect, useState, type ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useTranslations } from "next-intl";
import { ChevronUp, ListChecks, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudyBuilderDraft } from "@/app/common/studyBuilder/model/StudyBuilder";

/** From here up the plan is a column beside the conversation; below, a sheet over it. */
const WIDE_QUERY = "(min-width: 1024px)";

/**
 * Whether the builder has room for the plan beside the conversation. True on
 * the server and the first render, so a desktop never flashes the phone layout.
 */
export function useWideBuilder(): boolean {
	const [wide, setWide] = useState(true);
	useEffect(() => {
		const query = window.matchMedia(WIDE_QUERY);
		const update = () => setWide(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);
	return wide;
}

/**
 * The plan, folded into a pill that floats over the conversation on a phone:
 * its name and how many readings it has so far. It glows when a turn reshapes
 * the plan, so the change is noticed without the plan taking the screen.
 */
export function PlanPill({ draft, draftVersion, onOpen, className }: { draft: StudyBuilderDraft | null; draftVersion: number; onOpen: () => void; className?: string }) {
	const t = useTranslations("studyBuilder");
	const [flash, setFlash] = useState(false);

	useEffect(() => {
		if (!draftVersion) return;
		setFlash(true);
		const timer = setTimeout(() => setFlash(false), 1200);
		return () => clearTimeout(timer);
	}, [draftVersion]);

	const count = draft?.steps.length ?? 0;
	return (
		<button
			type="button"
			onClick={onOpen}
			aria-label={t("showPlan")}
			className={cn(
				"pointer-events-auto flex max-w-full items-center gap-2 rounded-full border bg-card/95 py-1.5 pl-3 pr-2 text-sm shadow-lg backdrop-blur transition-shadow duration-700 supports-[backdrop-filter]:bg-card/80",
				flash && "ring-2 ring-primary/60 shadow-primary/20",
				className,
			)}
			data-testid="builder-plan-pill"
		>
			<ListChecks className="h-4 w-4 shrink-0 text-primary" />
			<span className={cn("min-w-0 truncate", !draft && "text-muted-foreground")}>{draft?.name ?? t("planPending")}</span>
			{draft && (
				<span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">{count}</span>
			)}
			<ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
		</button>
	);
}

/**
 * The plan as a bottom sheet over the builder. Rendered in place rather than in
 * a portal: the builder sits in the immersive shell, which is sized to what is
 * visible above the on-screen keyboard, so the sheet (and the plan editor's
 * fields inside it) stays above the keyboard too.
 */
export function PlanSheet({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: ReactNode }) {
	const t = useTranslations("studyBuilder");
	return (
		<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
			<DialogPrimitive.Overlay className="absolute inset-0 z-40 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
			<DialogPrimitive.Content
				aria-describedby={undefined}
				className="absolute inset-x-0 bottom-0 z-50 flex h-[88%] flex-col rounded-t-2xl border-t bg-background shadow-2xl duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom"
				data-testid="builder-plan-sheet"
			>
				<div className="flex shrink-0 items-center justify-between px-3 pt-2">
					<span aria-hidden className="mx-auto h-1 w-10 rounded-full bg-muted-foreground/30" />
				</div>
				<DialogPrimitive.Title className="sr-only">{t("planLabel")}</DialogPrimitive.Title>
				<DialogPrimitive.Close
					className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
					aria-label={t("closePlan")}
				>
					<X className="h-4 w-4" />
				</DialogPrimitive.Close>
				<div className="min-h-0 flex-1 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">{children}</div>
			</DialogPrimitive.Content>
		</DialogPrimitive.Root>
	);
}
