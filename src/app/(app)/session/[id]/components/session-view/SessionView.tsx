"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics";
import { chapterGetByCanonicalRefSS } from "@/app/common/chapter/service/chapterGetByCanonicalRefSS";
import { bookGetByAbbreviationAndBibleIdSS } from "@/app/common/book/service/server/bookGetByAbbreviationAndBibleIdSS";
import { sessionUpdateCurrentStepSS } from "@/app/common/session/service/sessionUpdateCurrentStepSS";
import { sessionStepCompletionCreateSS } from "@/app/common/sessionStepCompletion/service/sessionStepCompletionCreateSS";
import { sessionStepCompletionGetBySessionIdSS } from "@/app/common/sessionStepCompletion/service/sessionStepCompletionGetBySessionIdSS";
import { SessionFull } from "@/app/common/session/model/Session";
import { StudyStep } from "@/app/common/studyStep/model/StudyStep";
import { StudyMode } from "@/app/common/sessionStepCompletion/model/SessionStepCompletion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  BookOpen,
  List,
  X,
  Eye,
  Keyboard,
  Headphones,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { AppShell } from "@/components/app";
import { ReaderEngine, ReaderMode } from "@/components/reader/ReaderEngine";
import { entityMentionsGetForChapterSS } from "@/app/common/entity/service/server/entityMentionsGetForChapterSS";
import { languageNameToIso } from "@/lib/bibleLanguage";
import { recordActivity } from "@/lib/activityClient";
import { recordAppRoute } from "@/lib/lastAppRoute";
import { PremiumGate } from "@/components/premium";
import { SessionProgressProvider, useSessionProgress } from "../../context/SessionProgressContext";
import { SessionCompleteDialog } from "./SessionCompleteDialog";
import { sessionFinishSS } from "@/app/common/session/service/sessionFinishSS";
import type { SessionSummary } from "@/app/common/session/model/SessionSummary";
import { formatStepReference } from "@/app/common/studyStep/model/reference";
import { StepContentView } from "@/components/study/steps/StepContentView";
import { StepKindIcon } from "@/components/study/steps/StepKindIcon";

interface SessionViewParams {
  session: SessionFull;
}

// Reference formatting lives in studyStep/model/reference so the reader, the
// sessions list and the completion recap cannot drift apart on the same step.
const formatBibleReference = formatStepReference;

export default function SessionView({ session: initialSession }: SessionViewParams) {
  const steps = (initialSession.study?.steps || []) as StudyStep[];

  // Get step completions for this session (needed to pass to provider)
  const { data: stepCompletions } = useQuery({
    queryKey: ["stepCompletions", initialSession.id],
    queryFn: () => sessionStepCompletionGetBySessionIdSS(initialSession.id),
  });

  return (
    <SessionProgressProvider
      initialSession={initialSession}
      steps={steps}
      stepCompletions={stepCompletions}
    >
      <SessionViewInner initialSession={initialSession} steps={steps} />
    </SessionProgressProvider>
  );
}

// Mode icon component
const ModeIcon = ({ mode }: { mode: StudyMode }) => {
  switch (mode) {
    case "read":
      return <Eye className="h-3 w-3" />;
    case "type":
      return <Keyboard className="h-3 w-3" />;
    case "listen":
      return <Headphones className="h-3 w-3" />;
    default:
      return null;
  }
};

function SessionViewInner({ initialSession, steps }: { initialSession: SessionFull; steps: StudyStep[] }) {
  const t = useTranslations();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Overrides the generic "Sessions" label so the /bible back-pill reads
  // "Back to <study name>" instead.
  const studyName = initialSession.study?.name;
  useEffect(() => {
    recordAppRoute(`/session/${initialSession.id}`, studyName || undefined);
  }, [initialSession.id, studyName]);

  // The DAO hydrates `bible` on the study, but SessionFull.study is typed StudyFull
  // (which has no `bible`), so it must be read through a cast. Widening StudyFull to
  // carry the bible would remove this — worth doing separately.
  const sessionBible = (
    initialSession.study as {
      bible?: { id?: string; name?: string; version?: string; slug?: string; language?: string; audioEnabled?: boolean };
    }
  )?.bible;

  const {
    currentStepIndex,
    currentChapterInStep,
    currentMode,
    completedSteps,
    modeProgress,
    setCurrentStepIndex,
    setCurrentChapterInStep,
    setCurrentMode,
    markStepCompleted,
  } = useSessionProgress();

  const [showStepsSidebar, setShowStepsSidebar] = useState(() => {
    if (typeof window !== "undefined") return window.innerWidth >= 768;
    return true;
  });

  const currentStep = steps[currentStepIndex];
  // A step that is not Scripture (text, reflection, image...) has no chapters,
  // no reader and no read / type / listen: it shows its content and is "done".
  const isScriptureStep = (currentStep?.kind ?? "scripture") === "scripture";
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? Math.round(((currentStepIndex + 1) / totalSteps) * 100) : 0;

  // Get book data to determine total chapters for whole-book steps
  const bibleId = initialSession.study?.bibleId;
  const { data: bookData } = useQuery({
    queryKey: ["book", currentStep?.bookAbbreviation, bibleId],
    queryFn: async () => {
      if (!bibleId || !currentStep?.bookAbbreviation) {
        return null;
      }
      return await bookGetByAbbreviationAndBibleIdSS(bibleId, currentStep.bookAbbreviation);
    },
    enabled: Boolean(bibleId && currentStep?.bookAbbreviation && isScriptureStep),
  });

  // Calculate chapter range for current step
  const getChapterRange = () => {
    if (!currentStep || !isScriptureStep) return { start: 1, end: 1, total: 1 };

    const startChapter = currentStep.startChapter ?? 1;
    const endChapter = currentStep.endChapter ??
      (currentStep.startChapter ? currentStep.startChapter : (bookData?.numChapters ?? 1));

    return {
      start: startChapter,
      end: endChapter,
      total: endChapter - startChapter + 1
    };
  };

  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  const chapterRange = getChapterRange();
  const isMultiChapterStep = chapterRange.total > 1;
  const actualChapterNumber = chapterRange.start + currentChapterInStep - 1;
  const isLastChapterInStep = currentChapterInStep >= chapterRange.total;
  const isFirstChapterInStep = currentChapterInStep === 1;

  // Get chapter data for the current step using canonical references
  const { data: chapterData, isLoading: isChapterLoading } = useQuery({
    queryKey: ["chapter", currentStep?.bookAbbreviation, actualChapterNumber, bibleId],
    queryFn: async () => {
      if (!bibleId || !currentStep?.bookAbbreviation) {
        return null;
      }
      return await chapterGetByCanonicalRefSS(
        bibleId,
        currentStep.bookAbbreviation,
        actualChapterNumber
      );
    },
    enabled: Boolean(bibleId && currentStep?.bookAbbreviation && actualChapterNumber && isScriptureStep),
  });

  // Study steps may carry loose abbreviations ("Pr.", "Mat"); alignment and
  // people are keyed on the USFM code, so use the book the chapter resolved to.
  const canonicalBookAbbreviation = chapterData?.bookApiId;

  // Character mentions for the current chapter (powers reader linking in Study).
  const { data: mentions } = useQuery({
    queryKey: ["entityMentions", canonicalBookAbbreviation, actualChapterNumber, sessionBible?.language],
    queryFn: async () => {
      if (!canonicalBookAbbreviation) return undefined;
      return await entityMentionsGetForChapterSS(
        canonicalBookAbbreviation,
        actualChapterNumber,
        languageNameToIso(sessionBible?.language),
      );
    },
    enabled: Boolean(canonicalBookAbbreviation && actualChapterNumber),
  });

  // Mutation to update current step
  const updateStepMutation = useMutation({
    mutationFn: async (stepId: string) => {
      await sessionUpdateCurrentStepSS(initialSession.id, stepId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  // Mutation to save step completion
  const saveCompletionMutation = useMutation({
    mutationFn: sessionStepCompletionCreateSS,
    onSuccess: (_, completion) => {
      const stepIndex = steps.findIndex((step) => step.id === completion.stepId);
      track("step_completed", {
        sessionId: completion.sessionId,
        stepId: completion.stepId,
        mode: completion.mode,
        stepKind: steps[stepIndex]?.kind,
        stepIndex,
        isFirstStep: stepIndex === 0,
      });
      queryClient.invalidateQueries({ queryKey: ["stepCompletions", initialSession.id] });
      void recordActivity("study");
      toast.success(t("toast.stepCompleted"));
    },
    onError: () => {
      toast.error(t("common.error"));
    },
  });

  // Handle completing current chapter (and step if on last chapter)
  // Resolves once the step's completion is saved (or failed: the toast has
  // said so), so finishing the study can wait for its last step.
  const handleCompleteChapter = async (stats?: { accuracy?: number; wpm?: number; timeSpentSeconds?: number }) => {
    if (isLastChapterInStep) {
      const mode: StudyMode = isScriptureStep ? currentMode : "done";
      // Optimistic update via context
      markStepCompleted(currentStep.id, mode);

      // Persist to DB
      const saved = saveCompletionMutation.mutateAsync({
        sessionId: initialSession.id,
        stepId: currentStep.id,
        mode,
        accuracy: stats?.accuracy,
        wpm: stats?.wpm,
        timeSpentSeconds: stats?.timeSpentSeconds,
      }).catch(() => undefined);

      if (currentStepIndex < totalSteps - 1) {
        // Move to next step
        const nextStep = steps[currentStepIndex + 1];
        setCurrentStepIndex(currentStepIndex + 1);
        setCurrentChapterInStep(1);
        updateStepMutation.mutate(nextStep.id);
      }
      await saved;
    } else {
      // Move to next chapter within the step
      setCurrentChapterInStep(currentChapterInStep + 1);
    }
  };

  // Finish the whole study: record the final step, stamp the session complete,
  // then show the recap.
  //
  // handleCompleteChapter() has to run here because on the last step the footer's
  // "Next" button — its only other caller — is REPLACED by this one. Without it
  // the final step's session_step_completion row was never written in read mode,
  // so the recap (and the sessions list) under-reported every finished study by
  // exactly one step.
  const handleFinishStudy = async () => {
    if (isFinishing) return;
    setIsFinishing(true);

    // Awaited: the recap is read from the saved completions, so the last
    // step's has to be written before the session is finished.
    await handleCompleteChapter();

    try {
      const res = await sessionFinishSS(initialSession.id);
      track("session_completed", {
        sessionId: initialSession.id,
        studyId: initialSession.study?.id,
      });
      if (res.summary) {
        setSummary(res.summary);
        return;
      }
    } catch {
      // Falling through to the old behaviour beats trapping someone on the last
      // page of a study they have finished.
    } finally {
      setIsFinishing(false);
    }

    router.push("/session");
  };

  // Navigate to previous chapter within step
  const handlePreviousChapter = () => {
    if (!isFirstChapterInStep) {
      setCurrentChapterInStep(currentChapterInStep - 1);
    }
  };

  // Navigate to next chapter within step (without completing)
  const handleNextChapter = () => {
    if (!isLastChapterInStep) {
      setCurrentChapterInStep(currentChapterInStep + 1);
    }
  };

  // Handle going to previous step
  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      const prevStep = steps[currentStepIndex - 1];
      setCurrentStepIndex(currentStepIndex - 1);
      setCurrentChapterInStep(1);
      updateStepMutation.mutate(prevStep.id);
    }
  };

  // Handle clicking on a step in the sidebar
  const handleStepClick = (index: number) => {
    if (index !== currentStepIndex) {
      setCurrentStepIndex(index);
      setCurrentChapterInStep(1);
      updateStepMutation.mutate(steps[index].id);
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setShowStepsSidebar(false);
      }
    }
  };

  const isLastStep = currentStepIndex === totalSteps - 1;
  const isFirstStep = currentStepIndex === 0;

  const currentReference = !isScriptureStep
    ? ""
    : isMultiChapterStep
    ? formatBibleReference(currentStep, chapterData?.bookName, actualChapterNumber)
    : formatBibleReference(currentStep, chapterData?.bookName);

  // Get completion modes for a step from context
  const getStepCompletionModes = (stepId: string): StudyMode[] => {
    return completedSteps.get(stepId) || [];
  };

  // Sidebar content as JSX variable (not a component) to preserve React reconciliation
  const stepsSidebarContent = (
    <>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-lg truncate flex-1">{initialSession.study?.name}</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={() => setShowStepsSidebar(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-muted-foreground">{t("session.progress")}</span>
            <span className="font-medium text-primary">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Steps list */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const completedModes = getStepCompletionModes(step.id);
            const isCompleted = completedModes.length > 0;
            const stepIsScripture = (step.kind ?? "scripture") === "scripture";
            const stepReference = stepIsScripture ? formatBibleReference(step) : "";
            const showModeProgress = isActive && modeProgress && !modeProgress.isComplete && modeProgress.total > 0;

            return (
              <button
                key={step.id}
                onClick={() => handleStepClick(index)}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-all",
                  "hover:bg-muted/50 border",
                  isActive
                    ? "bg-primary/10 border-primary/30"
                    : isCompleted
                    ? "bg-muted/30 border-transparent"
                    : "border-transparent"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : isActive ? (
                      <Circle className="h-5 w-5 text-primary fill-primary/20" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium truncate",
                        isActive ? "text-primary" : isCompleted ? "text-muted-foreground" : ""
                      )}
                    >
                      {t("session.stepNumber", { number: index + 1 })}
                    </p>
                    {stepReference ? (
                      <p className="text-xs text-primary/70 truncate mt-0.5 flex items-center gap-1">
                        <BookOpen className="h-3 w-3 inline-block" />
                        {stepReference}
                      </p>
                    ) : !stepIsScripture && (
                      <p className="text-xs text-primary/70 truncate mt-0.5 flex items-center gap-1">
                        <StepKindIcon kind={step.kind} className="h-3 w-3 inline-block" />
                        {t(`study.stepKinds.${step.kind}` as never)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {step.title}
                    </p>
                    {/* Mode progress indicator for active step */}
                    {showModeProgress && (
                      <div className="mt-1.5">
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary/60 rounded-full transition-all duration-300"
                            style={{ width: `${(modeProgress.current / modeProgress.total) * 100}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {modeProgress.current}/{modeProgress.total}
                        </p>
                      </div>
                    )}
                    {/* Show completed modes */}
                    {completedModes.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {completedModes.map((mode, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-0.5 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded"
                          >
                            <ModeIcon mode={mode} />
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );

  return (
    // Immersive: the shell is pinned to the visible screen and the page never
    // scrolls — on a phone the text gets everything the chrome doesn't need.
    <AppShell immersive>
      <PremiumGate>
        <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* Mobile sidebar overlay backdrop */}
        {showStepsSidebar && (
          <div
            className="absolute inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setShowStepsSidebar(false)}
          />
        )}

        {/* Mobile sidebar: a drawer over the screen, not a column beside the text */}
        <aside
          className={cn(
            "absolute inset-y-0 left-0 z-40 w-72 max-w-[85vw] bg-card border-r flex flex-col shadow-xl transition-transform duration-300 md:hidden",
            showStepsSidebar ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {stepsSidebarContent}
        </aside>

        {/* Desktop sidebar */}
        <aside
          className={cn(
            "border-r bg-card flex-shrink-0 flex-col overflow-hidden transition-all duration-300 hidden md:flex",
            showStepsSidebar ? "w-72" : "w-0"
          )}
        >
          {showStepsSidebar && stepsSidebarContent}
        </aside>

        {/* Main content */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
          {/* Step header. One slim line on phones: the steps button and the title. */}
          <header className="thb-keyboard-hide shrink-0 border-b bg-card px-2 py-1 md:p-6 md:pb-4">
            <div className="max-w-4xl mx-auto flex items-center gap-1 md:block">
              <div className="flex shrink-0 items-center justify-between md:mb-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {/* Always visible on mobile, conditional on desktop */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 md:mr-2",
                      showStepsSidebar ? "md:hidden" : ""
                    )}
                    onClick={() => setShowStepsSidebar(true)}
                    aria-label={t("session.stepsButton")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <StepKindIcon kind={currentStep?.kind ?? "scripture"} className="hidden h-4 w-4 md:block" />
                  <span className="hidden md:inline">
                    {t("session.stepNumber", { number: currentStepIndex + 1 })} {t("session.of")} {totalSteps}
                  </span>
                  {isMultiChapterStep && (
                    <>
                      <span className="mx-1 hidden md:inline">•</span>
                      <span className="hidden text-primary font-medium md:inline">
                        {t("session.chapterProgress", { current: currentChapterInStep, total: chapterRange.total })}
                      </span>
                    </>
                  )}
                  {currentReference && (
                    <>
                      <span className="mx-1 hidden sm:inline">•</span>
                      <span className="font-medium text-foreground hidden sm:inline">
                        {currentReference}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <h1 className="min-w-0 flex-1 truncate text-sm font-semibold md:whitespace-normal md:text-2xl md:font-bold">
                {currentStep?.title || t("session.untitledStep")}
              </h1>
            </div>
          </header>

          {/* Scripture content - Mode dependent */}
          {/* The engine owns scrolling and centring so its info panel can sit
              beside the text column and reflow it instead of covering it. */}
          <div className="flex min-h-0 flex-1 flex-col">
            {!isScriptureStep && currentStep ? (
              <div className="min-h-0 flex-1">
                <StepContentView step={currentStep} bibleId={bibleId} />
              </div>
            ) : (
            <div className={cn(
              "min-h-0 flex-1",
              currentMode === "type" && "h-full"
            )}>
              <ReaderEngine
                verses={chapterData?.verses ?? []}
                mode={currentMode as ReaderMode}
                onModeChange={setCurrentMode}
                bookName={chapterData?.bookName}
                chapterNumber={actualChapterNumber}
                startVerse={currentStep?.startVerse}
                endVerse={currentStep?.endVerse}
                explanation={currentStep?.explanation}
                mentions={mentions}
                isPremium
                bibleLanguage={sessionBible?.language}
                bibleName={sessionBible?.version || sessionBible?.name}
                bibleVersion={sessionBible?.version}
                bibleSlug={sessionBible?.slug}
                bookSlug={bookData?.slug}
                bibleId={sessionBible?.id}
                bookAbbreviation={canonicalBookAbbreviation}
                audioEnabled={sessionBible?.audioEnabled ?? false}
                studyStepId={currentStep?.id}
                sessionId={initialSession.id}
                isLastChapterInStep={isLastChapterInStep}
                isLoading={isChapterLoading}
              />
            </div>
            )}
          </div>

          {/* Navigation footer */}
          {/* Slim on phones, and out of the way while the keyboard is up (Type mode). */}
          <footer className="thb-keyboard-hide shrink-0 px-2 pt-1.5 md:p-4 border-t bg-card pb-[max(0.375rem,env(safe-area-inset-bottom))] md:pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="max-w-4xl mx-auto flex items-center justify-between max-md:[&_button]:h-9">
              {/* Left side: Previous button (step or chapter) */}
              <div className="flex items-center gap-2">
                {isMultiChapterStep && !isFirstChapterInStep ? (
                  <Button
                    variant="outline"
                    onClick={handlePreviousChapter}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">{t("common.previous")}</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handlePreviousStep}
                    disabled={isFirstStep || updateStepMutation.isPending}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">{t("common.previous")}</span>
                  </Button>
                )}
              </div>

              {/* Center: Progress indicator */}
              <div className="flex items-center gap-2">
                <Progress value={progress} className="w-24 h-2 hidden sm:block" />
                <span className="text-sm text-muted-foreground">
                  {currentStepIndex + 1} / {totalSteps}
                </span>
                {isMultiChapterStep && (
                  <span className="text-xs text-primary">
                    ({currentChapterInStep}/{chapterRange.total})
                  </span>
                )}
              </div>

              {/* Right side: Next/Finish button */}
              {isLastStep && isLastChapterInStep ? (
                <Button
                  onClick={() => void handleFinishStudy()}
                  disabled={isFinishing}
                  className="bg-primary hover:bg-primary/90"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">{t("session.finishStudy")}</span>
                  <span className="sm:hidden">{t("session.finishShort")}</span>
                </Button>
              ) : isMultiChapterStep && !isLastChapterInStep ? (
                <Button
                  variant="outline"
                  onClick={handleNextChapter}
                >
                  <span className="hidden sm:inline">{t("session.nextChapter")}</span>
                  <span className="sm:hidden">{t("common.next")}</span>
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => void handleCompleteChapter()}
                  disabled={updateStepMutation.isPending || saveCompletionMutation.isPending}
                >
                  <span className="hidden sm:inline">{t("common.next")}</span>
                  <span className="sm:hidden">{t("common.next")}</span>
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </footer>
        </main>
        </div>
        <SessionCompleteDialog
          summary={summary}
          open={summary !== null}
          onClose={() => {
            setSummary(null);
            router.push("/session");
          }}
        />
      </PremiumGate>
    </AppShell>
  );
}
