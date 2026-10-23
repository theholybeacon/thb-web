"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BookOpen, Check, ExternalLink, Globe, Library, Newspaper, User } from "lucide-react";

import type { StudyStep } from "@/app/common/studyStep/model/StudyStep";
import {
	CharacterContent,
	ImageContent,
	LinkContent,
	ReflectionContent,
	stepContentSchema,
	TextContent,
	VideoContent,
	youtubeEmbedUrl,
} from "@/app/common/studyStep/model/StepContent";
import { entityCardGetSS } from "@/app/common/entity/service/server/entityCardGetSS";
import { noteCreateSS } from "@/app/common/note/service/server/noteCreateSS";
import { NOTE_TITLE_MAX_LENGTH } from "@/app/common/note/noteScope";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/toast";
import { StepKindIcon, STEP_KIND_LABEL_KEY } from "./StepKindIcon";

/**
 * The body of a study step that is not Scripture, shown in the session where
 * the reader would be for a passage. Moving on (the footer's Next) is what
 * completes it, as "done".
 */
export function StepContentView({ step, bibleId }: { step: StudyStep; bibleId?: string | null }) {
	const t = useTranslations("session.steps");
	const tStudy = useTranslations("study");
	const parsed = stepContentSchema.safeParse(step.content);

	return (
		<div className="h-full overflow-y-auto">
			<article className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-10" data-step-kind={step.kind}>
				<p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
					<StepKindIcon kind={step.kind} className="h-3 w-3" />
					{tStudy(STEP_KIND_LABEL_KEY[parsed.success ? parsed.data.kind : "text"] as never)}
				</p>
				{step.explanation && (
					<p className="mb-6 text-muted-foreground">{step.explanation}</p>
				)}
				{!parsed.success ? (
					<p className="text-muted-foreground">{t("unavailable")}</p>
				) : parsed.data.kind === "text" ? (
					<TextStep content={parsed.data} />
				) : parsed.data.kind === "reflection" ? (
					<ReflectionStep content={parsed.data} step={step} bibleId={bibleId} />
				) : parsed.data.kind === "character" ? (
					<CharacterStep content={parsed.data} />
				) : parsed.data.kind === "image" ? (
					<ImageStep content={parsed.data} />
				) : parsed.data.kind === "video" ? (
					<VideoStep content={parsed.data} title={step.title} />
				) : (
					<LinkStep content={parsed.data} />
				)}
			</article>
		</div>
	);
}

/** Paragraphs separated by a blank line, set like the reader's text. */
function Paragraphs({ text, className }: { text: string; className?: string }) {
	return (
		<div className={className}>
			{text.split(/\n\s*\n/).map((paragraph, i) => (
				<p key={i} className="mb-4 whitespace-pre-line last:mb-0">
					{paragraph.trim()}
				</p>
			))}
		</div>
	);
}

function TextStep({ content }: { content: TextContent }) {
	return <Paragraphs text={content.body} className="font-heading text-lg leading-relaxed" />;
}

/**
 * A question to answer in the reader's own words. The answer is saved as a
 * note, on the step's anchor passage when it has one, otherwise on the Bible
 * the study is read in, so it turns up in My Notes like any other.
 */
function ReflectionStep({
	content,
	step,
	bibleId,
}: {
	content: ReflectionContent;
	step: StudyStep;
	bibleId?: string | null;
}) {
	const t = useTranslations("session.steps");
	const [answer, setAnswer] = useState("");
	const [saved, setSaved] = useState(false);

	const save = useMutation({
		mutationFn: async () => {
			if (!bibleId) throw new Error("No Bible to save the note on");
			const anchor = step.bookAbbreviation && step.startChapter
				? { bookAbbreviation: step.bookAbbreviation, chapter: step.startChapter, verse: step.startVerse }
				: null;
			return await noteCreateSS({
				targetType: anchor ? (anchor.verse ? "verse" : "chapter") : "bible",
				bibleId,
				bookAbbreviation: anchor?.bookAbbreviation ?? null,
				chapter: anchor?.chapter ?? null,
				verse: anchor?.verse ?? null,
				title: content.prompt.slice(0, NOTE_TITLE_MAX_LENGTH),
				content: answer,
			});
		},
		onSuccess: () => {
			setSaved(true);
			toast.success(t("reflectionSaved"));
		},
		onError: () => toast.error(t("reflectionError")),
	});

	return (
		<div className="space-y-4">
			<blockquote className="border-l-4 border-primary/60 pl-4 font-heading text-xl leading-relaxed">
				{content.prompt}
			</blockquote>
			{saved ? (
				<div className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
					<Check className="h-4 w-4 text-primary" />
					<span className="flex-1">{t("reflectionSavedHint")}</span>
					<Button asChild variant="outline" size="sm">
						<Link href="/notes">{t("openNotes")}</Link>
					</Button>
				</div>
			) : (
				<>
					<Textarea
						value={answer}
						onChange={(e) => setAnswer(e.target.value)}
						placeholder={t("reflectionPlaceholder")}
						aria-label={t("reflectionPlaceholder")}
						rows={6}
					/>
					<div className="flex items-center justify-between gap-3">
						<p className="text-xs text-muted-foreground">{t("reflectionHint")}</p>
						<Button
							onClick={() => save.mutate()}
							disabled={!answer.trim() || save.isPending || !bibleId}
						>
							{save.isPending ? t("saving") : t("saveReflection")}
						</Button>
					</div>
				</>
			)}
		</div>
	);
}

function CharacterStep({ content }: { content: CharacterContent }) {
	const t = useTranslations("session.steps");
	const { data: card, isLoading } = useQuery({
		queryKey: ["entityCard", content.entitySlug],
		queryFn: async () => await entityCardGetSS(content.entitySlug),
	});

	return (
		<div className="rounded-xl border bg-card p-6">
			<div className="mb-4 flex items-center gap-3">
				<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
					<User className="h-6 w-6" />
				</div>
				<div>
					<h2 className="font-heading text-2xl font-semibold">
						{card?.name ?? (isLoading ? "…" : content.entitySlug)}
					</h2>
					<p className="text-xs text-muted-foreground">{t("characterLabel")}</p>
				</div>
			</div>
			{content.note && <Paragraphs text={content.note} className="mb-4 text-base leading-relaxed" />}
			{card?.overview && (
				<Paragraphs text={card.overview} className="mb-4 text-sm leading-relaxed text-muted-foreground" />
			)}
			<Button asChild variant="outline">
				<Link href={`/bible/people/${content.entitySlug}`} target="_blank">
					<BookOpen className="mr-2 h-4 w-4" />
					{t("openProfile")}
				</Link>
			</Button>
		</div>
	);
}

function ImageStep({ content }: { content: ImageContent }) {
	return (
		<figure className="space-y-3">
			{/* A plain img on purpose: the images are public-domain art hosted on
			    Wikimedia, at sizes next/image would only re-encode. */}
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={content.url}
				alt={content.alt}
				className="mx-auto max-h-[60vh] w-auto rounded-lg border bg-muted object-contain"
			/>
			<figcaption className="space-y-1 text-center">
				{content.caption && <p className="font-heading text-base">{content.caption}</p>}
				<p className="text-xs text-muted-foreground">
					{content.sourceUrl ? (
						<a href={content.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
							{content.credit}
						</a>
					) : (
						content.credit
					)}
				</p>
			</figcaption>
		</figure>
	);
}

function VideoStep({ content, title }: { content: VideoContent; title: string }) {
	return (
		<figure className="space-y-3">
			<div className="relative w-full overflow-hidden rounded-lg border bg-black" style={{ aspectRatio: "16 / 9" }}>
				<iframe
					src={youtubeEmbedUrl(content)}
					title={title}
					className="absolute inset-0 h-full w-full"
					allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
					loading="lazy"
					referrerPolicy="strict-origin-when-cross-origin"
				/>
			</div>
			<figcaption className="space-y-1 text-center">
				{content.caption && <p className="font-heading text-base">{content.caption}</p>}
				<p className="text-xs text-muted-foreground">{content.credit}</p>
			</figcaption>
		</figure>
	);
}

function LinkStep({ content }: { content: LinkContent }) {
	const t = useTranslations("session.steps");
	const Icon = content.linkType === "book" ? Library : content.linkType === "article" ? Newspaper : Globe;
	const host = (() => {
		try {
			return new URL(content.url).host.replace(/^www\./, "");
		} catch {
			return content.url;
		}
	})();

	return (
		<div className="rounded-xl border bg-card p-6">
			<div className="flex items-start gap-4">
				<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
					<Icon className="h-6 w-6" />
				</div>
				<div className="min-w-0 flex-1">
					<p className="text-xs uppercase tracking-wide text-muted-foreground">
						{t(`linkType.${content.linkType}` as never)}
					</p>
					<h2 className="font-heading text-xl font-semibold">{content.title}</h2>
					{(content.author || content.source) && (
						<p className="mt-0.5 text-sm text-muted-foreground">
							{[content.author, content.source].filter(Boolean).join(" · ")}
						</p>
					)}
					{content.description && <Paragraphs text={content.description} className="mt-3 text-base leading-relaxed" />}
					<Button asChild variant="outline" className="mt-4">
						<a href={content.url} target="_blank" rel="noopener noreferrer">
							<ExternalLink className="mr-2 h-4 w-4" />
							{t("openLink", { host })}
						</a>
					</Button>
				</div>
			</div>
		</div>
	);
}
