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
  Sparkles,
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
  const t = useTranslations();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showStepsSidebar, setShowStepsSidebar] = useState(true);
  const [currentMode, setCurrentMode] = useState<StudyMode>("read");

  // Find current step index
  const getCurrentStepIndex = (session: SessionFull) => {
    if (!session.study?.steps?.length) return 0;
    const index = session.study.steps.findIndex(
      (step) => step.id === session.currentStepId
    );
    return index === -1 ? 0 : index;
  };

  const [currentStepIndex, setCurrentStepIndex] = useState(() =>
    getCurrentStepIndex(initialSession)
  );

  // Track current chapter within a multi-chapter step (1-indexed within the step)
  const [currentChapterInStep, setCurrentChapterInStep] = useState(1);

  const steps = (initialSession.study?.steps || []) as StudyStep[];
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

  // Get step completions for this session
  const { data: stepCompletions } = useQuery({
    queryKey: ["stepCompletions", initialSession.id],
    queryFn: () => sessionStepCompletionGetBySessionIdSS(initialSession.id),
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
      // Complete the step and save completion
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
        setCurrentChapterInStep(1); // Reset chapter counter for new step
        updateStepMutation.mutate(nextStep.id);
      }
    } else {
      // Move to next chapter within the step
      setCurrentChapterInStep(prev => prev + 1);
    }
  };

  // Navigate to previous chapter within step
  const handlePreviousChapter = () => {
    if (!isFirstChapterInStep) {
      setCurrentChapterInStep(prev => prev - 1);
    }
  };

  // Navigate to next chapter within step (without completing)
  const handleNextChapter = () => {
    if (!isLastChapterInStep) {
      setCurrentChapterInStep(prev => prev + 1);
    }
  };

  // Handle going to previous step
  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      const prevStep = steps[currentStepIndex - 1];
      setCurrentStepIndex(currentStepIndex - 1);
      setCurrentChapterInStep(1); // Reset chapter counter
      updateStepMutation.mutate(prevStep.id);
    }
  };

  // Handle clicking on a step in the sidebar
  const handleStepClick = (index: number) => {
    if (index !== currentStepIndex) {
      setCurrentStepIndex(index);
      setCurrentChapterInStep(1); // Reset chapter counter
      updateStepMutation.mutate(steps[index].id);
    }
  };

  const isLastStep = currentStepIndex === totalSteps - 1;
  const isFirstStep = currentStepIndex === 0;

  // Format bible reference for current step (use full book name when available)
  // For multi-chapter steps, show the current chapter being viewed
  const currentReference = isMultiChapterStep
    ? formatBibleReference(currentStep, chapterData?.bookName, actualChapterNumber)
    : formatBibleReference(currentStep, chapterData?.bookName);

  // Get completion modes for a step
  const getStepCompletionModes = (stepId: string): StudyMode[] => {
    if (!stepCompletions) return [];
    return stepCompletions
      .filter((c) => c.stepId === stepId)
      .map((c) => c.mode);
  };

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

  return (
    <AppShell>
      <PremiumGate>
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* Step sidebar - collapsible */}
        <aside
          className={cn(
            "border-r bg-card flex-shrink-0 flex flex-col overflow-hidden transition-all duration-300",
            showStepsSidebar ? "w-72" : "w-0"
          )}
        >
          {showStepsSidebar && (
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
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden bg-background">
          {/* Step header */}
          <header className="p-4 md:p-6 pb-4 border-b bg-card">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {!showStepsSidebar && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 mr-2"
                      onClick={() => setShowStepsSidebar(true)}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  )}
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
                      <span className="mx-1">•</span>
                      <span className="font-medium text-foreground">
                        {currentReference}
                      </span>
                    </>
                  )}
                </div>

                {/* Mode selector */}
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
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

          {/* Explanation banner */}
          {currentStep?.explanation && (
            <div className="px-4 md:px-6 py-4 bg-primary/5 border-b">
              <div className="max-w-4xl mx-auto flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentStep.explanation}
                </p>
              </div>
            </div>
          )}

          {/* Scripture content - Mode dependent */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-4 md:p-6">
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
                      isLastChapter={isLastChapterInStep}
                      onComplete={() => handleCompleteChapter()}
                    />
                  )}

                  {currentMode === "type" && (
                    <TypeMode
                      verses={chapterData.verses}
                      startVerse={currentStep?.startVerse}
                      endVerse={currentStep?.endVerse}
                      isLastChapter={isLastChapterInStep}
                      onComplete={(stats) => handleCompleteChapter(stats)}
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
                      isLastChapter={isLastChapterInStep}
                      onComplete={(stats) => handleCompleteChapter(stats)}
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
          <footer className="p-4 border-t bg-card">
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

              {/* Right side: Next/Skip/Finish button */}
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
                  onClick={() => {
                    if (currentStepIndex < totalSteps - 1) {
                      const nextStep = steps[currentStepIndex + 1];
                      setCurrentStepIndex(currentStepIndex + 1);
                      setCurrentChapterInStep(1); // Reset chapter counter
                      updateStepMutation.mutate(nextStep.id);
                    }
                  }}
                  disabled={updateStepMutation.isPending}
                >
                  <span className="hidden sm:inline">{t("session.skipStep")}</span>
                  <span className="sm:hidden">{t("common.skip")}</span>
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
