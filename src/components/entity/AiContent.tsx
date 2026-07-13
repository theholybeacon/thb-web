import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { FlagButton } from "./FlagButton";

interface AiContentProps {
	/** When set, renders a titled section header + flag button. Omit for a plain callout. */
	title?: string;
	entityContentId?: string;
	section?: string;
	children: ReactNode;
}

/**
 * Shared "AI-generated" flag wrapper (the Sparkles callout). Without a title it
 * renders the compact callout used by the reading modes; with a title it renders
 * a labeled character-page section with a report affordance.
 */
export function AiContent({ title, entityContentId, section, children }: AiContentProps) {
	if (!title) {
		return (
			<div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
				<div className="flex items-start gap-2">
					<Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
					{children}
				</div>
			</div>
		);
	}

	return (
		<div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
			<div className="flex items-center justify-between gap-2 mb-2">
				<div className="flex items-center gap-2 text-xs font-medium text-primary">
					<Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
					<span>{title}</span>
					<span className="text-muted-foreground font-normal">· AI-generated</span>
				</div>
				{entityContentId && section && <FlagButton entityContentId={entityContentId} section={section} />}
			</div>
			{children}
		</div>
	);
}
