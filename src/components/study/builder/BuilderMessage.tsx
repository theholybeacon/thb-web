import { Fragment, ReactNode } from "react";
import { Brain, ListChecks, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { StudyBuilderMessage } from "@/app/common/studyBuilder/model/StudyBuilder";

/** **bold** inside a line; everything else is plain text (never HTML). */
function inline(text: string): ReactNode[] {
	return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
		part.startsWith("**") && part.endsWith("**") && part.length > 4
			? <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
			: <Fragment key={i}>{part}</Fragment>,
	);
}

/** The light markdown the builder writes: paragraphs, "- " / "1. " lists and bold. */
export function RichText({ text }: { text: string }) {
	const blocks = text.split(/\n{2,}/);
	return (
		<div className="space-y-2">
			{blocks.map((block, i) => {
				const lines = block.split("\n").filter((l) => l.trim());
				const isList = lines.length > 0 && lines.every((l) => /^\s*(?:[-*•]|\d+\.)\s+/.test(l));
				if (isList) {
					return (
						<ul key={i} className="space-y-1 pl-1">
							{lines.map((l, j) => (
								<li key={j} className="flex gap-2">
									<span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
									<span>{inline(l.replace(/^\s*(?:[-*•]|\d+\.)\s+/, ""))}</span>
								</li>
							))}
						</ul>
					);
				}
				return (
					<p key={i}>
						{lines.map((l, j) => (
							<Fragment key={j}>
								{j > 0 && <br />}
								{inline(l)}
							</Fragment>
						))}
					</p>
				);
			})}
		</div>
	);
}

export function AssistantAvatar({ pulsing }: { pulsing?: boolean }) {
	return (
		<div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-sm", pulsing && "animate-pulse")}>
			<Sparkles className="h-4 w-4" />
		</div>
	);
}

export function BuilderMessage({ message }: { message: StudyBuilderMessage }) {
	const t = useTranslations("studyBuilder");

	if (message.role === "user") {
		return (
			<div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300" data-testid="builder-user-message">
				<div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm">
					{message.content}
				</div>
			</div>
		);
	}

	const remembered = message.payload?.remembered ?? [];
	return (
		<div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300" data-testid="builder-assistant-message">
			<AssistantAvatar />
			<div className="min-w-0 max-w-[85%] space-y-2">
				<div className="rounded-2xl rounded-tl-md border bg-card px-4 py-3 text-sm leading-relaxed shadow-sm">
					<RichText text={message.content} />
				</div>
				{(message.payload?.draftChanged || remembered.length > 0) && (
					<div className="flex flex-wrap gap-1.5 text-xs">
						{message.payload?.draftChanged && (
							<span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
								<ListChecks className="h-3 w-3" />
								{t("planUpdated")}
							</span>
						)}
						{remembered.map((fact) => (
							<span key={fact} className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-700 dark:text-amber-400" title={fact}>
								<Brain className="h-3 w-3" />
								{t("remembered", { fact })}
							</span>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

/** The reply while it arrives: dots until the first words, then the words with a caret. */
export function StreamingMessage({ text }: { text: string }) {
	return (
		<div className="flex gap-3" data-testid="builder-streaming">
			<AssistantAvatar pulsing />
			<div className="min-w-0 max-w-[85%] rounded-2xl rounded-tl-md border bg-card px-4 py-3 text-sm leading-relaxed shadow-sm">
				{text ? (
					<div className="relative">
						<RichText text={text} />
						<span className="ml-0.5 inline-block h-4 w-1.5 translate-y-0.5 animate-pulse rounded-sm bg-primary/70" />
					</div>
				) : (
					<div className="flex h-5 items-center gap-1">
						{[0, 150, 300].map((delay) => (
							<span key={delay} className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: `${delay}ms` }} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
