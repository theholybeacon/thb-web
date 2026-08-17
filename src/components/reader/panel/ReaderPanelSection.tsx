"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ReaderPanelSectionProps {
	icon: LucideIcon;
	title: string;
	/** Rendered as a small badge beside the title — usually a count. */
	badge?: ReactNode;
	expanded: boolean;
	onToggle: () => void;
	children: ReactNode;
}

/**
 * One collapsible block of the reader info panel. The panel is meant to be
 * dense, so headers stay compact and several sections can be open at once.
 */
export function ReaderPanelSection({
	icon: Icon,
	title,
	badge,
	expanded,
	onToggle,
	children,
}: ReaderPanelSectionProps) {
	return (
		<section className="border-b last:border-b-0">
			<h3>
				<button
					type="button"
					onClick={onToggle}
					aria-expanded={expanded}
					className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-muted/60"
				>
					<Icon className="h-4 w-4 shrink-0 text-primary" />
					<span className="min-w-0 flex-1 truncate text-sm font-medium">{title}</span>
					{badge != null && (
						<span className="shrink-0 rounded-full bg-muted px-1.5 text-xs tabular-nums text-muted-foreground">
							{badge}
						</span>
					)}
					<ChevronDown
						className={cn(
							"h-4 w-4 shrink-0 text-muted-foreground transition-transform",
							expanded && "rotate-180",
						)}
					/>
				</button>
			</h3>

			{expanded && <div className="px-3 pb-4">{children}</div>}
		</section>
	);
}
