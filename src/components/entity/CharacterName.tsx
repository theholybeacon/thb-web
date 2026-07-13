"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CharacterNameProps {
	slug: string;
	children: ReactNode;
	/** When true, the name links to its character page. When false, it's locked. */
	interactive: boolean;
	/** Called when a non-premium user clicks a locked name (opens the upgrade modal). */
	onLockedClick?: () => void;
	variant?: "inline" | "chip";
}

/**
 * Single source of truth for how a character name renders in the reader:
 * clickable link for premium users, or a locked affordance that invites an
 * upgrade (hover tooltip on desktop, opens the upgrade modal on click) for
 * everyone else. Names are always visible either way.
 */
export function CharacterName({ slug, children, interactive, onLockedClick, variant = "inline" }: CharacterNameProps) {
	const inlineClass = "text-primary underline decoration-dotted underline-offset-2 hover:decoration-solid";
	const chipClass = "text-xs rounded-full border px-2.5 py-1 text-primary hover:bg-muted";

	if (interactive) {
		return (
			<Link href={`/bible/people/${slug}`} className={variant === "chip" ? chipClass : inlineClass}>
				{children}
			</Link>
		);
	}

	const lockedClass =
		variant === "chip"
			? "text-xs rounded-full border border-dashed px-2.5 py-1 text-muted-foreground hover:text-primary hover:border-primary/40 cursor-pointer"
			: "text-muted-foreground underline decoration-dotted underline-offset-2 cursor-pointer hover:text-primary";

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button type="button" onClick={onLockedClick} className={cn(lockedClass, "bg-transparent p-0 font-inherit")}>
					{children}
				</button>
			</TooltipTrigger>
			<TooltipContent>Unlock character insights with Premium</TooltipContent>
		</Tooltip>
	);
}
