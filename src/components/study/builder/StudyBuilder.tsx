"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowUp, Check, CheckCircle2, Circle, Hand, History, Loader2, MessageSquarePlus, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BibleSelector } from "@/components/app";
import { logger } from "@/app/utils/logger";
import { toast } from "@/lib/toast";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { bibleGetAllSS } from "@/app/common/bible/service/bibleGetAllSS";
import { userSetDefaultBibleSS } from "@/app/common/user/service/server/userSetDefaultBibleSS";
import { pickDefaultBible } from "@/lib/bibleFollowsLanguage";
import { useBibleFollowsLanguage } from "@/components/app/useBibleFollowsLanguage";
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
import { PlanPill, PlanSheet, useWideBuilder } from "./PlanSheet";

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
	const [followsLanguage] = useBibleFollowsLanguage();
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
	/** Below `lg` the plan is a pill over the conversation that opens a sheet, not a column. */
	const wide = useWideBuilder();
	const [planOpen, setPlanOpen] = useState(false);

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

	// Translation: the conversation's own, then the reader's stored choice (if in the app's
	// language, while the Bible follows it), then the locale's default.
	useEffect(() => {
		if (!bibles?.length || bibleId) return;
		const match = pickDefaultBible(bibles, { storedId: user?.defaultBibleId, locale, followsLanguage });
		if (match) setBibleId(match.id);
	}, [bibles, bibleId, locale, user?.defaultBibleId, followsLanguage]);

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

	// The chat shrinks when the on-screen keyboard opens (the shell is sized to
	// what is visible). If the reader was at the latest message, keep it there,
	// just above the composer, instead of leaving it under the keyboard.
	const distanceFromBottom = useRef(0);
	useEffect(() => {
		const scroller = scrollRef.current;
		if (!scroller || typeof ResizeObserver === "undefined") return;
		const onScroll = () => {
			distanceFromBottom.current = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
		};
		const observer = new ResizeObserver(() => {
			if (distanceFromBottom.current < 80) scroller.scrollTop = scroller.scrollHeight;
		});
		scroller.addEventListener("scroll", onScroll, { passive: true });
		observer.observe(scroller);
		return () => {
			scroller.removeEventListener("scroll", onScroll);
			observer.disconnect();
		};
	}, [mode]);

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
			track("study_created", { studyId, source: mode === "manual" ? "builder_manual" : "builder", length: draft.length, depth: draft.depth, steps: draft.steps.length });
			toast.success(t("created"));
			void queryClient.invalidateQueries({ queryKey: ["studyBuilderConversations"] });
			void queryClient.invalidateQueries({ queryKey: ["studies"] });
			router.push(`/study/${studyId}`);
		} catch (e) {
			// Server errors are English (and redacted in production); the toast is translated.
			logger.error(e);
			toast.error(t("createFailed"));
			setSubmitting(false);
		}
	}

	async function saveStudy() {
		if (!draft || !editStudyId) return;
		setSubmitting(true);
		try {
			const conversationId = await builder.ensureSaved();
			await studyBuilderSaveStudySS(conversationId, bibleId, draft);
			track("study_edited", { studyId: editStudyId, mode, steps: draft.steps.length });
			builder.setConversationStatus("created");
			setSavedBibleId(bibleId);
			toast.success(t("saved"));
			void queryClient.invalidateQueries({ queryKey: ["study", editStudyId] });
			void queryClient.invalidateQueries({ queryKey: ["studies"] });
			router.push(`/study/${editStudyId}`);
		} catch (e) {
			logger.error(e);
			toast.error(t("saveFailed"));
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
					void userSetDefaultBibleSS(id).then(() =>
						track("default_bible_set", { bibleId: id, source: "study_create" })
					);
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

	const plan =
		mode === "manual" ? (
			<PlanEditor draft={draft} onChange={(next) => builder.editDraft(next, bibleId || null)} names={names} disabled={busy || !ready} footer={footer} />
		) : (
			<PlanPanel
				draft={draft}
				draftVersion={builder.draftVersion}
				busy={busy}
				names={names}
				// From the sheet, a request to the builder closes it: the answer is in the conversation.
				onAsk={(message) => {
					setPlanOpen(false);
					submit(message);
				}}
				footer={footer}
			/>
		);

	return (
		// Fills the immersive shell. On a phone the conversation gets the screen: one
		// slim row of controls above it, and the plan floats over it as a pill.
		<div className="relative flex min-h-0 flex-1 flex-col gap-2 p-2 sm:gap-4 sm:p-4 lg:p-6">
			<div className="flex items-center justify-between gap-2 sm:flex-wrap sm:gap-3">
				<div className="flex min-w-0 items-center gap-2 sm:gap-3">
					<Link href={editing ? `/study/${editStudyId}` : "/study"} className="shrink-0 text-muted-foreground hover:text-foreground" aria-label={editing ? t("backToStudy") : t("backToStudies")}>
						<ArrowLeft className="h-5 w-5" />
					</Link>
					<div className="min-w-0">
						<h1 className="truncate text-base font-bold sm:text-2xl">{editing ? t("titleEdit") : t("title")}</h1>
						<p className="hidden text-sm text-muted-foreground sm:block">{editing ? t("subtitleEdit") : t("subtitle")}</p>
					</div>
				</div>
				<div className="flex shrink-0 items-center gap-1 sm:flex-wrap sm:gap-2">
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
								className={cn("relative z-10 flex items-center justify-center gap-1.5 rounded-full px-2.5 py-1 font-medium transition-colors sm:px-4 sm:py-1.5", mode === value ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
							>
								<Icon className={cn("h-4 w-4", mode === value && "text-primary")} /> <span className="max-sm:sr-only">{label}</span>
							</button>
						))}
					</div>
					{!editing && (
						<>
							<Popover>
								<PopoverTrigger asChild>
									<Button variant="outline" size="sm" className="max-sm:h-8 max-sm:w-8 max-sm:p-0" disabled={!conversations?.length} aria-label={t("history")}>
										<History className="h-4 w-4 sm:mr-2" /> <span className="max-sm:hidden">{t("history")}</span>
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
							<Button variant="outline" size="sm" className="max-sm:h-8 max-sm:w-8 max-sm:p-0" onClick={startNew} disabled={busy} aria-label={t("newConversation")}>
								<MessageSquarePlus className="h-4 w-4 sm:mr-2" /> <span className="max-sm:hidden">{t("newConversation")}</span>
							</Button>
						</>
					)}
				</div>
			</div>

			{mode === "ai" && (
				<div className="thb-keyboard-hide">
					<KnowledgeStrip highlights={builder.highlights} remembered={builder.remembered} />
				</div>
			)}

			<div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_440px]">
				{mode === "manual" ? (
					<div key="manual-left" className="relative min-h-0 animate-in fade-in slide-in-from-left-2 duration-300">
						<PassageFinder names={names} onAdd={addStep} disabled={busy || !ready} />
						{!wide && (
							<div className="pointer-events-none absolute inset-x-3 bottom-3 flex justify-end">
								<PlanPill draft={draft} draftVersion={builder.draftVersion} onOpen={() => setPlanOpen(true)} />
							</div>
						)}
					</div>
				) : (
					<div key="ai-left" className="flex min-h-0 flex-col overflow-hidden rounded-2xl border bg-muted/20 animate-in fade-in slide-in-from-right-2 duration-300 lg:min-h-[420px]">
						<div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto overscroll-contain p-3 sm:space-y-4 sm:p-4 lg:p-6" data-testid="builder-chat">
							{messages.map((m) => <BuilderMessage key={m.id} message={m} />)}
							{busy && <StreamingMessage text={streamingText} />}
							{error && !busy && (
								<div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
									{/* `error` is the untranslated server message; it only decides whether to show this. */}
									<span className="flex-1">{t("chatError")}</span>
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
							{/* Floats at the bottom of the conversation, just above the composer. */}
							{!wide && (
								<div className="pointer-events-none sticky bottom-0 flex justify-end pt-1">
									<PlanPill draft={draft} draftVersion={builder.draftVersion} onOpen={() => setPlanOpen(true)} />
								</div>
							)}
						</div>

						<form
							className="border-t bg-card p-2 sm:p-3"
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
									// 16px on phones: iOS zooms the page in on a smaller field.
									className="max-h-40 flex-1 resize-none bg-transparent py-1.5 text-base outline-none placeholder:text-muted-foreground sm:text-sm"
								/>
								<Button type="submit" size="icon" className="h-8 w-8 shrink-0 rounded-full" disabled={busy || !input.trim()} aria-label={t("send")}>
									<ArrowUp className="h-4 w-4" />
								</Button>
							</div>
						</form>
					</div>
				)}

				{wide && <div className="min-h-0">{plan}</div>}
			</div>

			{!wide && (
				<PlanSheet open={planOpen} onOpenChange={setPlanOpen}>
					{plan}
				</PlanSheet>
			)}
		</div>
	);
}
