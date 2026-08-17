"use client";

import { Headphones } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const ICON_SIZES = {
	sm: "h-3.5 w-3.5",
	md: "h-4 w-4",
};

interface ListenableIndicatorProps {
	/** `bible.audioEnabled` — see src/lib/bibleLicense.ts for what sets it. */
	audioEnabled?: boolean | null;
	className?: string;
	size?: "sm" | "md";
}

/**
 * Marks a translation we're licensed to narrate. Renders nothing otherwise —
 * the catalogue is 404 rows, so only the 46 listenable ones earn an icon.
 *
 * Uses the native `title` attribute rather than <Tooltip>: the only
 * TooltipProvider is mounted inside ReaderEngine, and this renders in the
 * Bible catalogue and study-create picker too.
 */
export function ListenableIndicator({
	audioEnabled,
	className,
	size = "sm",
}: ListenableIndicatorProps) {
	const t = useTranslations("audio");

	if (!audioEnabled) return null;

	const label = t("listenable");

	return (
		<span
			role="img"
			aria-label={label}
			title={label}
			className={cn("inline-flex shrink-0 text-primary", className)}
		>
			<Headphones className={ICON_SIZES[size]} />
		</span>
	);
}
