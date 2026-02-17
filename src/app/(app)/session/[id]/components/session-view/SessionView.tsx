"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
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
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { AppShell } from "@/components/app";
import { ReadMode, TypeMode, ListenMode } from "../modes";
import { PremiumGate } from "@/components/premium";
import { SessionProgressProvider, useSessionProgress } from "../../context/SessionProgressContext";

interface SessionViewParams {
  session: SessionFull;
}

// Helper function to format bible reference using canonical fields
function formatBibleReference(step: StudyStep | undefined, bookName?: string, currentChapter?: number): string {
  if (!step) return "";

  const book = bookName || step.bookAbbreviation;
  if (!book) return "";

  const startChapter = step.startChapter;
  const endChapter = step.endChapter;
  const startVerse = step.startVerse;
  const endVerse = step.endVerse;

  // If currentChapter is provided, show the current chapter being viewed
  if (currentChapter) {
    if (startVerse && endVerse && startVerse !== endVerse) {
      return `${book} ${currentChapter}:${startVerse}-${endVerse}`;
    }
    if (startVerse) {
      return `${book} ${currentChapter}:${startVerse}`;
    }
    return `${book} ${currentChapter}`;
  }

  if (!startChapter) {
    return book;
  }

  if (startVerse && endVerse && startVerse !== endVerse) {
    return `${book} ${startChapter}:${startVerse}-${endVerse}`;
  }

  if (startVerse) {
    return `${book} ${startChapter}:${startVerse}`;
  }

  if (endChapter && endChapter !== startChapter) {
    return `${book} ${startChapter}-${endChapter}`;
  }

  return `${book} ${startChapter}`;
}

const STUDY_MODES: { id: StudyMode; icon: typeof Eye; labelKey: string }[] = [
  { id: "read", icon: Eye, labelKey: "session.modeRead" },
  { id: "type", icon: Keyboard, labelKey: "session.modeType" },
  { id: "listen", icon: Headphones, labelKey: "session.modeListen" },
];

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
    enabled: Boolean(bibleId && currentStep?.bookAbbreviation),
  });

  // Calculate chapter range for current step
  const getChapterRange = () => {
    if (!currentStep) return { start: 1, end: 1, total: 1 };

    const startChapter = currentStep.startChapter ?? 1;
    const endChapter = currentStep.endChapter ??
      (currentStep.startChapter ? currentStep.startChapter : (bookData?.numChapters ?? 1));

    return {
      start: startChapter,
      end: endChapter,
      total: endChapter - startChapter + 1
    };
  };

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
    enabled: Boolean(bibleId && currentStep?.bookAbbreviation && actualChapterNumber),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stepCompletions", initialSession.id] });
      toast.success(t("toast.stepCompleted"));
    },
    onError: () => {
      toast.error(t("common.error"));
    },
  });

  // Handle completing current chapter (and step if on last chapter)
  const handleCompleteChapter = (stats?: { accuracy?: number; wpm?: number; timeSpentSeconds?: number }) => {
    if (isLastChapterInStep) {
      // Optimistic update via context
      markStepCompleted(currentStep.id, currentMode);

      // Persist to DB
      saveCompletionMutation.mutate({
        sessionId: initialSession.id,
        stepId: currentStep.id,
        mode: currentMode,
        accuracy: stats?.accuracy,
        wpm: stats?.wpm,
        timeSpentSeconds: stats?.timeSpentSeconds,
      });

      if (currentStepIndex < totalSteps - 1) {
        // Move to next step
        const nextStep = steps[currentStepIndex + 1];
        setCurrentStepIndex(currentStepIndex + 1);
        setCurrentChapterInStep(1);
        updateStepMutation.mutate(nextStep.id);
      }
    } else {
      // Move to next chapter within the step
      setCurrentChapterInStep(currentChapterInStep + 1);
    }
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

  const currentReference = isMultiChapterStep
    ? formatBibleReference(currentStep, chapterData?.bookName, actualChapterNumber)
    : formatBibleReference(currentStep, chapterData?.bookName);

  // Get completion modes for a step from context
  const getStepCompletionModes = (stepId: string): StudyMode[] => {
    return completedSteps.get(stepId) || [];
  };

  // Sidebar content extracted for reuse in desktop and mobile
  const StepsSidebarContent = () => (
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
            const stepReference = formatBibleReference(step);
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
                    {stepReference && (
                      <p className="text-xs text-primary/70 truncate mt-0.5 flex items-center gap-1">
                        <BookOpen className="h-3 w-3 inline-block" />
                        {stepReference}
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
    <AppShell>
      <PremiumGate>
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* Mobile sidebar overlay backdrop */}
        {showStepsSidebar && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setShowStepsSidebar(false)}
          />
        )}

        {/* Mobile sidebar */}
        <aside
          className={cn(
            "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-72 bg-card border-r flex flex-col transition-transform duration-300 md:hidden",
            showStepsSidebar ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <StepsSidebarContent />
        </aside>

        {/* Desktop sidebar */}
        <aside
          className={cn(
            "border-r bg-card flex-shrink-0 flex-col overflow-hidden transition-all duration-300 hidden md:flex",
            showStepsSidebar ? "w-72" : "w-0"
          )}
        >
          {showStepsSidebar && <StepsSidebarContent />}
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden bg-background">
          {/* Step header */}
          <header className="p-3 md:p-6 pb-3 md:pb-4 border-b bg-card">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {/* Always visible on mobile, conditional on desktop */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 mr-2",
                      showStepsSidebar ? "md:hidden" : ""
                    )}
                    onClick={() => setShowStepsSidebar(true)}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <BookOpen className="h-4 w-4" />
                  <span>
                    {t("session.stepNumber", { number: currentStepIndex + 1 })} {t("session.of")} {totalSteps}
                  </span>
                  {isMultiChapterStep && (
                    <>
                      <span className="mx-1">•</span>
                      <span className="text-primary font-medium">
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

                {/* Mode selector */}
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1 overflow-x-auto">
                  {STUDY_MODES.map((mode) => (
                    <Button
                      key={mode.id}
                      variant={currentMode === mode.id ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "h-8 px-3",
                        currentMode === mode.id && "bg-background shadow-sm"
                      )}
                      onClick={() => setCurrentMode(mode.id)}
                    >
                      <mode.icon className="h-4 w-4 mr-1.5" />
                      <span className="hidden sm:inline">{t(mode.labelKey)}</span>
                    </Button>
                  ))}
                </div>
              </div>
              <h1 className="text-xl md:text-2xl font-bold">{currentStep?.title || t("session.untitledStep")}</h1>
            </div>
          </header>

          {/* Scripture content - Mode dependent */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-3 py-3 md:px-6 md:py-6">
              {isChapterLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground text-sm">{t("common.loading")}</p>
                </div>
              ) : chapterData?.verses && chapterData.verses.length > 0 ? (
                <>
                  {currentMode === "read" && (
                    <ReadMode
                      verses={chapterData.verses}
                      startVerse={currentStep?.startVerse}
                      endVerse={currentStep?.endVerse}
                      bookName={chapterData.bookName}
                      chapterNumber={actualChapterNumber}
                      explanation={currentStep?.explanation}
                    />
                  )}

                  {currentMode === "type" && (
                    <TypeMode
                      verses={chapterData.verses}
                      startVerse={currentStep?.startVerse}
                      endVerse={currentStep?.endVerse}
                      explanation={currentStep?.explanation}
                    />
                  )}

                  {currentMode === "listen" && (
                    <ListenMode
                      verses={chapterData.verses}
                      startVerse={currentStep?.startVerse}
                      endVerse={currentStep?.endVerse}
                      bookName={chapterData.bookName}
                      chapterNumber={actualChapterNumber}
                      bibleLanguage={(initialSession.study as any)?.bible?.language}
                      explanation={currentStep?.explanation}
                    />
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  {currentReference && (
                    <div className="mb-6 pb-4 border-b">
                      <h2 className="text-2xl md:text-3xl font-serif font-semibold text-center text-foreground">
                        {currentReference}
                      </h2>
                    </div>
                  )}
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">{t("session.noContent")}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {currentStep?.bookAbbreviation && currentStep?.startChapter ? (
                      <>Reading: {currentStep.bookAbbreviation} Chapter {currentStep.startChapter}</>
                    ) : (
                      <>Step reference not set</>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation footer */}
          <footer className="p-3 md:p-4 border-t bg-card pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
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
                  <span className="text-xs text-primary hidden sm:inline">
                    ({currentChapterInStep}/{chapterRange.total})
                  </span>
                )}
              </div>

              {/* Right side: Next/Finish button */}
              {isLastStep && isLastChapterInStep ? (
                <Button
                  onClick={() => router.push("/session")}
                  className="bg-primary hover:bg-primary/90"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">{t("session.finishStudy")}</span>
                  <span className="sm:hidden">Finish</span>
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
                  onClick={() => handleCompleteChapter()}
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
      </PremiumGate>
    </AppShell>
  );
}
