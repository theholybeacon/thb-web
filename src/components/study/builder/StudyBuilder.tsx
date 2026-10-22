"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import posthog from "posthog-js";
import { ArrowLeft, ArrowUp, Check, CheckCircle2, Circle, Hand, History, Loader2, MessageSquarePlus, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BibleSelector } from "@/components/app";
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
	studyBuilderOpenForStudySS,
	studyBuilderSaveStudySS,
} from "@/app/common/studyBuilder/service/server/studyBuilderSS";
import type { StudyBuilderDraftStep } from "@/app/common/studyBuilder/model/StudyBuilder";
import { useStudyBuilder } from "./useStudyBuilder";
import { useBookNames } from "./useBookNames";
import { BuilderMessage, StreamingMessage } from "./BuilderMessage";
import { PlanPanel } from "./PlanPanel";
import { EMPTY_DRAFT, PlanEditor } from "./PlanEditor";
import { PassageFinder } from "./PassageFinder";
import { KnowledgeStrip } from "./KnowledgeStrip";

/** A conversation left this recently is picked up again instead of starting over. */
const RESUME_WITHIN_MS = 24 * 3600 * 1000;

type Mode = "ai" | "manual";
/** The way the reader last worked is the way the builder opens next time. */
const MODE_KEY = "thb.studyBuilder.mode";

/**
 * The study builder, in two modes over one plan. With AI: a conversation on
 * the left, the plan it produces on the right; the builder speaks first — it
 * already knows the reader — and every turn can reshape the plan. By hand: a
 * passage finder on the left, the plan as an editor on the right. The reader
 * can switch at any moment; each mode picks up the plan the other left.
 *
 * With `studyId` it edits that study, in the conversation it was built in,
 * right where the reader left it; saving keeps everyone's progress on it.
 */
export function StudyBuilder({ studyId: editStudyId }: { studyId?: string }) {
	const t = useTranslations("studyBuilder");
	const locale = useLocale();
	const router = useRouter();
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();
	const { user } = useLoggedUserContext();
	const editing = Boolean(editStudyId);

	/*
	 * The URL is left alone (?c= only deep-links into a conversation): rewriting
	 * it with history.replaceState mid-conversation is a navigation to the app
	 * router, which aborted in-flight server actions and could leave later ones
	 * (like "Create this study") queued forever.
	 */
	const refreshConversations = useCallback(() => {
		void queryClient.invalidateQueries({ queryKey: ["studyBuilderConversations"] });
	}, [queryClient]);

	const builder = useStudyBuilder(refreshConversations);
	const { messages, draft, status, streamingText, error, send, load, conversationStatus } = builder;
	const busy = status !== "idle";

	const [mode, setModeState] = useState<Mode | null>(null);
	const [ready, setReady] = useState(false);
	const [input, setInput] = useState("");
	const [bibleId, setBibleId] = useState("");
	/** The translation the study being edited is saved in; changing it is a change to save. */
	const [savedBibleId, setSavedBibleId] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);

	const { data: bibles, isLoading: biblesLoading } = useQuery({ queryKey: ["bibles"], queryFn: () => bibleGetAllSS() });
	const { data: conversations } = useQuery({ queryKey: ["studyBuilderConversations"], queryFn: () => studyBuilderConversationListSS(), enabled: !editing });
	const names = useBookNames(bibleId);

	useEffect(() => {
		setModeState(window.localStorage.getItem(MODE_KEY) === "manual" ? "manual" : "ai");
	}, []);

	function setMode(next: Mode) {
		setModeState(next);
		window.localStorage.setItem(MODE_KEY, next);
	}

	// Translation: the conversation's own, then the reader's stored choice, then the locale's default.
	useEffect(() => {
		if (!bibles?.length || bibleId) return;
		const stored = user?.defaultBibleId ? bibles.find((b) => b.id === user.defaultBibleId) : undefined;
		const match = stored ?? bibles.find((b) => b.slug === recommendedSlugForLocale(locale)) ?? bibles.find((b) => b.slug === "bsb-en");
		if (match) setBibleId(match.id);
	}, [bibles, bibleId, locale, user?.defaultBibleId]);

	const startNew = useCallback(() => {
		load(null);
		setReady(true);
	}, [load]);

	const open = useCallback(async (id: string) => {
		const conversation = await studyBuilderConversationGetSS(id);
		if (!conversation) return false;
		// A plan that is already a study is edited from the study.
		if (conversation.studyId) {
			router.push(`/study/${conversation.studyId}/edit`);
			return true;
		}
		load(conversation);
		if (conversation.bibleId) setBibleId(conversation.bibleId);
		setReady(true);
		return true;
	}, [load, router]);

	// First visit. Editing: the study's own conversation. Creating: the conversation in the URL, else the one left a moment ago, else a new one.
	const started = useRef(false);
	useEffect(() => {
		if (started.current) return;
		if (editStudyId) {
			started.current = true;
			void (async () => {
				try {
					const opened = await studyBuilderOpenForStudySS(editStudyId);
					load(opened.conversation);
					setSavedBibleId(opened.bibleId);
					const bible = opened.conversation.bibleId ?? opened.bibleId;
					if (bible) setBibleId(bible);
					setReady(true);
				} catch {
					toast.error(t("openFailed"));
					router.push("/study");
				}
			})();
			return;
		}
		if (conversations === undefined) return;
		started.current = true;
		const requested = searchParams.get("c");
		const recent = conversations.find((c) => c.status === "active" && Date.now() - new Date(c.updatedAt).getTime() < RESUME_WITHIN_MS);
		void (async () => {
			const id = requested ?? recent?.id;
			if (id && (await open(id))) return;
			startNew();
		})();
	}, [editStudyId, conversations, searchParams, open, startNew, load, router, t]);

	// With AI and nothing said yet, the builder opens the conversation itself — about the plan, if there already is one.
	useEffect(() => {
		if (mode === "ai" && ready && messages.length === 0 && !busy && !error) void send(null, bibleId || null);
	}, [mode, ready, messages.length, busy, error, send, bibleId]);

	useEffect(() => {
		scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
	}, [messages.length, streamingText, status, mode]);

	function submit(text: string) {
		const message = text.trim();
		if (!message || busy) return;
		setInput("");
		void send(message, bibleId || null);
		inputRef.current?.focus();
	}

	function addStep(step: StudyBuilderDraftStep) {
		const plan = draft ?? EMPTY_DRAFT;
		builder.editDraft({ ...plan, steps: [...plan.steps, step] }, bibleId || null);
	}

	async function createStudy() {
		if (!draft) return;
		setSubmitting(true);
		try {
			const conversationId = await builder.ensureSaved();
			const { studyId } = await studyBuilderCreateStudySS(conversationId, bibleId, draft);
			posthog.capture("study_created", { source: mode === "manual" ? "builder_manual" : "builder", length: draft.length, depth: draft.depth, steps: draft.steps.length });
			toast.success(t("created"));
			void queryClient.invalidateQueries({ queryKey: ["studyBuilderConversations"] });
			void queryClient.invalidateQueries({ queryKey: ["studies"] });
			router.push(`/study/${studyId}`);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : t("createFailed"));
			setSubmitting(false);
		}
	}

	async function saveStudy() {
		if (!draft || !editStudyId) return;
		setSubmitting(true);
		try {
			const conversationId = await builder.ensureSaved();
			await studyBuilderSaveStudySS(conversationId, bibleId, draft);
			posthog.capture("study_edited", { mode, steps: draft.steps.length });
			builder.setConversationStatus("created");
			setSavedBibleId(bibleId);
			toast.success(t("saved"));
			void queryClient.invalidateQueries({ queryKey: ["study", editStudyId] });
			void queryClient.invalidateQueries({ queryKey: ["studies"] });
			router.push(`/study/${editStudyId}`);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : t("saveFailed"));
			setSubmitting(false);
		}
	}

	const dirty = conversationStatus === "editing" || (savedBibleId !== null && bibleId !== savedBibleId);
	const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
	const quickReplies = !busy && lastAssistant === messages[messages.length - 1] ? lastAssistant?.payload?.quickReplies ?? [] : [];
	const hasReadings = Boolean(draft?.steps.length);

	const footer = (
		<>
			<BibleSelector
				bibles={bibles}
				value={bibleId}
				onValueChange={(id) => {
					setBibleId(id);
					void userSetDefaultBibleSS(id);
				}}
				disabled={biblesLoading}
				isLoading={biblesLoading}
			/>
			{editing ? (
				<>
					<p className={cn("flex items-center justify-center gap-1.5 text-xs", dirty ? "text-amber-600 dark:text-amber-500" : "text-muted-foreground")} data-testid="builder-save-state">
						{dirty ? <Circle className="h-2.5 w-2.5 fill-current" /> : <Check className="h-3.5 w-3.5" />}
						{dirty ? t("unsaved") : t("upToDate")}
					</p>
					<Button className="w-full" size="lg" onClick={saveStudy} disabled={submitting || busy || !dirty || !bibleId || !hasReadings}>
						{submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("saving")}</> : t("save")}
					</Button>
				</>
			) : (
				<Button className="w-full" size="lg" onClick={createStudy} disabled={submitting || busy || !bibleId || !hasReadings}>
					{submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("creating")}</> : t("create")}
				</Button>
			)}
		</>
	);

	return (
		<div className="flex h-[calc(100dvh-var(--thb-header-h))] flex-col gap-4 p-4 lg:p-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<Link href={editing ? `/study/${editStudyId}` : "/study"} className="text-muted-foreground hover:text-foreground" aria-label={editing ? t("backToStudy") : t("backToStudies")}>
						<ArrowLeft className="h-5 w-5" />
					</Link>
					<div>
						<h1 className="text-2xl font-bold">{editing ? t("titleEdit") : t("title")}</h1>
						<p className="text-sm text-muted-foreground">{editing ? t("subtitleEdit") : t("subtitle")}</p>
					</div>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<div role="tablist" aria-label={t("modeLabel")} className="relative grid grid-cols-2 rounded-full border bg-muted p-1 text-sm">
						<span
							aria-hidden
							className={cn("absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-background shadow-sm transition-transform duration-300 ease-out", mode === "manual" && "translate-x-full")}
						/>
						{([["ai", Sparkles, t("modeAi")], ["manual", Hand, t("modeManual")]] as const).map(([value, Icon, label]) => (
							<button
								key={value}
								type="button"
								role="tab"
								aria-selected={mode === value}
								onClick={() => setMode(value)}
								className={cn("relative z-10 flex items-center justify-center gap-1.5 rounded-full px-4 py-1.5 font-medium transition-colors", mode === value ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
							>
								<Icon className={cn("h-4 w-4", mode === value && "text-primary")} /> {label}
							</button>
						))}
					</div>
					{!editing && (
						<>
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
													{c.studyId ? <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" /> : <MessageSquarePlus className="h-4 w-4 shrink-0 text-muted-foreground" />}
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
						</>
					)}
				</div>
			</div>

			{mode === "ai" && <KnowledgeStrip highlights={builder.highlights} remembered={builder.remembered} />}

			<div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_440px]">
				{mode === "manual" ? (
					<div key="manual-left" className="min-h-0 animate-in fade-in slide-in-from-left-2 duration-300">
						<PassageFinder names={names} onAdd={addStep} disabled={busy || !ready} />
					</div>
				) : (
					<div key="ai-left" className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border bg-muted/20 animate-in fade-in slide-in-from-right-2 duration-300">
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
									placeholder={t("placeholder")}
									aria-label={t("placeholder")}
									className="max-h-40 flex-1 resize-none bg-transparent py-1.5 text-sm outline-none placeholder:text-muted-foreground"
								/>
								<Button type="submit" size="icon" className="h-8 w-8 shrink-0 rounded-full" disabled={busy || !input.trim()} aria-label={t("send")}>
									<ArrowUp className="h-4 w-4" />
								</Button>
							</div>
						</form>
					</div>
				)}

				<div className="min-h-[360px] lg:min-h-0">
					{mode === "manual" ? (
						<PlanEditor draft={draft} onChange={(next) => builder.editDraft(next, bibleId || null)} names={names} disabled={busy || !ready} footer={footer} />
					) : (
						<PlanPanel draft={draft} draftVersion={builder.draftVersion} busy={busy} names={names} onAsk={submit} footer={footer} />
					)}
				</div>
			</div>
		</div>
	);
}
