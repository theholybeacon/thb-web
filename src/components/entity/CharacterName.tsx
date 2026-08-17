import Link from "next/link";
import type { ReactNode } from "react";

interface CharacterNameProps {
	slug: string;
	children: ReactNode;
	variant?: "inline" | "chip";
}

/**
 * Single source of truth for how a character name renders in the reader.
 *
 * Navigation is always open: gating the link itself made the whole feature look
 * broken to signed-out readers. The premium gate lives on the character page
 * instead, around the richer AI-generated content (see EntityContentSections).
 */
export function CharacterName({ slug, children, variant = "inline" }: CharacterNameProps) {
	const inlineClass = "text-primary underline decoration-dotted underline-offset-2 hover:decoration-solid";
	const chipClass = "text-xs rounded-full border px-2.5 py-1 text-primary hover:bg-muted";

	return (
		<Link href={`/bible/people/${slug}`} className={variant === "chip" ? chipClass : inlineClass}>
			{children}
		</Link>
	);
}
