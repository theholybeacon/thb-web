"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import posthog from "posthog-js";
import { ArrowLeft, ArrowUp, CheckCircle2, History, MessageSquarePlus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { bibleGetAllSS } from "@/app/common/bible/service/bibleGetAllSS";
import { userSetDefaultBibleSS } from "@/app/common/user/service/server/userSetDefaultBibleSS";
import { recommendedSlugForLocale } from "@/lib/recommendedBible";
import {
	studyBuilderConversationGetSS,
	studyBuilderConversationListSS,
	studyBuilderCreateStudySS,
} from "@/app/common/studyBuilder/service/server/studyBuilderSS";
import { useStudyBuilder } from "./useStudyBuilder";
import { BuilderMessage, StreamingMessage } from "./BuilderMessage";
import { PlanPanel } from "./PlanPanel";
import { KnowledgeStrip } from "./KnowledgeStrip";

/** A conversation left this recently is picked up again instead of starting over. */
const RESUME_WITHIN_MS = 24 * 3600 * 1000;

/**
 * The study builder: a conversation on the left, the plan it produces on the
 * right. The builder speaks first — it already knows the reader — and every
 * turn can reshape the plan.
 */
export function StudyBuilder() {
	const t = useTranslations("studyBuilder");
	const locale = useLocale();
	const router = useRouter();
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();
	const { user } = useLoggedUserContext();

	const setUrl = useCallback((id: string | null) => {
		window.history.replaceState(null, "", id ? `/study/create?c=${id}` : "/study/create");
		void queryClient.invalidateQueries({ queryKey: ["studyBuilderConversations"] });
	}, [queryClient]);

	const builder = useStudyBuilder(setUrl);
	const { messages, draft, status, streamingText, error, send, load } = builder;
	const busy = status !== "idle";

	const [input, setInput] = useState("");
	const [bibleId, setBibleId] = useState("");
	const [creating, setCreating] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);

	const { data: bibles, isLoading: biblesLoading } = useQuery({ queryKey: ["bibles"], queryFn: () => bibleGetAllSS() });
	const { data: conversations } = useQuery({ queryKey: ["studyBuilderConversations"], queryFn: () => studyBuilderConversationListSS() });

	// Translation: the conversation's own, then the reader's stored choice, then the locale's default.
	useEffect(() => {
		if (!bibles?.length || bibleId) return;
		const stored = user?.defaultBibleId ? bibles.find((b) => b.id === user.defaultBibleId) : undefined;
		const match = stored ?? bibles.find((b) => b.slug === recommendedSlugForLocale(locale)) ?? bibles.find((b) => b.slug === "bsb-en");
		if (match) setBibleId(match.id);
	}, [bibles, bibleId, locale, user?.defaultBibleId]);

	const startNew = useCallback(() => {
		load(null);
		setUrl(null);
		void send(null, bibleId || null);
	}, [load, send, setUrl, bibleId]);

	const open = useCallback(async (id: string) => {
		const conversation = await studyBuilderConversationGetSS(id);
		if (!conversation) return false;
		load(conversation);
		if (conversation.bibleId) setBibleId(conversation.bibleId);
		setUrl(conversation.id);
		return true;
	}, [load, setUrl]);

	// First visit: the conversation in the URL, else the one left a moment ago, else a new one.
	const started = useRef(false);
	useEffect(() => {
		if (started.current || conversations === undefined) return;
		started.current = true;
		const requested = searchParams.get("c");
		const recent = conversations.find((c) => c.status === "active" && Date.now() - new Date(c.updatedAt).getTime() < RESUME_WITHIN_MS);
		void (async () => {
			const id = requested ?? recent?.id;
			if (id && (await open(id))) return;
			startNew();
		})();
	}, [conversations, searchParams, open, startNew]);

	useEffect(() => {
		scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
	}, [messages.length, streamingText, status]);

	function submit(text: string) {
		const message = text.trim();
		if (!message || busy) return;
		setInput("");
		void send(message, bibleId || null);
		inputRef.current?.focus();
	}

	async function createStudy() {
		if (!builder.conversationId || !draft) return;
		setCreating(true);
		try {
			const { studyId } = await studyBuilderCreateStudySS(builder.conversationId, bibleId);
			posthog.capture("study_created", { source: "builder", length: draft.length, depth: draft.depth, steps: draft.steps.length });
			toast.success(t("created"));
			void queryClient.invalidateQueries({ queryKey: ["studyBuilderConversations"] });
			router.push(`/study/${studyId}`);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : t("createFailed"));
			setCreating(false);
		}
	}

	const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
	const quickReplies = !busy && !builder.createdStudyId && lastAssistant === messages[messages.length - 1] ? lastAssistant?.payload?.quickReplies ?? [] : [];

	return (
		<div className="flex h-[calc(100dvh-var(--thb-header-h))] flex-col gap-4 p-4 lg:p-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<Link href="/study" className="text-muted-foreground hover:text-foreground" aria-label={t("backToStudies")}>
						<ArrowLeft className="h-5 w-5" />
					</Link>
					<div>
						<h1 className="text-2xl font-bold">{t("title")}</h1>
						<p className="text-sm text-muted-foreground">{t("subtitle")}</p>
					</div>
				</div>
				<div className="flex gap-2">
					<Popover>
						<PopoverTrigger asChild>
							<Button variant="outline" size="sm" disabled={!conversations?.length}>
								<History className="mr-2 h-4 w-4" /> {t("history")}
							</Button>
						</PopoverTrigger>
						<PopoverContent align="end" className="w-80 p-2">
							<ul className="max-h-80 space-y-1 overflow-y-auto">
								{conversations?.map((c) => (
									<li key={c.id}>
										<button
											type="button"
											onClick={() => void open(c.id)}
											disabled={busy}
											className={cn("flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted", c.id === builder.conversationId && "bg-muted")}
										>
											{c.status === "created" ? <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" /> : <MessageSquarePlus className="h-4 w-4 shrink-0 text-muted-foreground" />}
											<span className="flex-1 truncate">{c.title ?? t("untitled")}</span>
											<span className="shrink-0 text-xs text-muted-foreground">{new Date(c.updatedAt).toLocaleDateString(locale)}</span>
										</button>
									</li>
								))}
							</ul>
						</PopoverContent>
					</Popover>
					<Button variant="outline" size="sm" onClick={startNew} disabled={busy}>
						<MessageSquarePlus className="mr-2 h-4 w-4" /> {t("newConversation")}
					</Button>
				</div>
			</div>

			<KnowledgeStrip highlights={builder.highlights} remembered={builder.remembered} />

			<div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_440px]">
				<div className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border bg-muted/20">
					<div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 lg:p-6" data-testid="builder-chat">
						{messages.map((m) => <BuilderMessage key={m.id} message={m} />)}
						{busy && <StreamingMessage text={streamingText} />}
						{error && !busy && (
							<div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
								<span className="flex-1">{error}</span>
								<Button variant="outline" size="sm" onClick={() => void send(null, bibleId || null)}>
									<RotateCcw className="mr-2 h-3.5 w-3.5" /> {t("retry")}
								</Button>
							</div>
						)}
						{quickReplies.length > 0 && (
							<div className="flex flex-wrap gap-2 pl-11" data-testid="builder-quick-replies">
								{quickReplies.map((reply, i) => (
									<button
										key={reply}
										type="button"
										onClick={() => submit(reply)}
										className="rounded-full border border-primary/30 bg-background px-3 py-1.5 text-sm text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground animate-in fade-in slide-in-from-bottom-1 fill-mode-both"
										style={{ animationDelay: `${i * 70}ms` }}
									>
										{reply}
									</button>
								))}
							</div>
						)}
					</div>

					<form
						className="border-t bg-card p-3"
						onSubmit={(e) => {
							e.preventDefault();
							submit(input);
						}}
					>
						<div className="flex items-end gap-2 rounded-xl border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-primary/40">
							<textarea
								ref={inputRef}
								value={input}
								onChange={(e) => {
									setInput(e.target.value);
									e.target.style.height = "auto";
									e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										submit(input);
									}
								}}
								rows={1}
								placeholder={builder.createdStudyId ? t("placeholderCreated") : t("placeholder")}
								disabled={!!builder.createdStudyId}
								aria-label={t("placeholder")}
								className="max-h-40 flex-1 resize-none bg-transparent py-1.5 text-sm outline-none placeholder:text-muted-foreground"
							/>
							<Button type="submit" size="icon" className="h-8 w-8 shrink-0 rounded-full" disabled={busy || !input.trim()} aria-label={t("send")}>
								<ArrowUp className="h-4 w-4" />
							</Button>
						</div>
					</form>
				</div>

				<div className="min-h-[360px] lg:min-h-0">
					<PlanPanel
						draft={draft}
						draftVersion={builder.draftVersion}
						busy={busy}
						bibles={bibles}
						biblesLoading={biblesLoading}
						bibleId={bibleId}
						onBibleChange={(id) => {
							setBibleId(id);
							void userSetDefaultBibleSS(id);
						}}
						onAsk={submit}
						onCreate={createStudy}
						creating={creating}
						createdStudyId={builder.createdStudyId}
					/>
				</div>
			</div>
		</div>
	);
}
