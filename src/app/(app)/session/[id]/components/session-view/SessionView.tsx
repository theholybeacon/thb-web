"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { chapterGetByCanonicalRefSS } from "@/app/common/chapter/service/chapterGetByCanonicalRefSS";
import { sessionUpdateCurrentStepSS } from "@/app/common/session/service/sessionUpdateCurrentStepSS";
import { SessionFull } from "@/app/common/session/model/Session";
import { StudyStep } from "@/app/common/studyStep/model/StudyStep";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/app";

interface SessionViewParams {
  session: SessionFull;
}

// Helper function to format bible reference using canonical fields
function formatBibleReference(step: StudyStep | undefined, bookName?: string): string {
  if (!step) return "";

  const book = bookName || step.bookAbbreviation;
  if (!book) return "";

  const startChapter = step.startChapter;
  const endChapter = step.endChapter;
  const startVerse = step.startVerse;
  const endVerse = step.endVerse;

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

export default function SessionView({ session: initialSession }: SessionViewParams) {
  const t = useTranslations();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showStepsSidebar, setShowStepsSidebar] = useState(true);

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

  const steps = (initialSession.study?.steps || []) as StudyStep[];
  const currentStep = steps[currentStepIndex];
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? Math.round(((currentStepIndex + 1) / totalSteps) * 100) : 0;

  // Get chapter data for the current step using canonical references
  const bibleId = initialSession.study?.bibleId;
  const { data: chapterData, isLoading: isChapterLoading } = useQuery({
    queryKey: ["chapter", currentStep?.bookAbbreviation, currentStep?.startChapter, bibleId],
    queryFn: async () => {
      if (!bibleId || !currentStep?.bookAbbreviation || !currentStep?.startChapter) {
        return null;
      }
      return await chapterGetByCanonicalRefSS(
        bibleId,
        currentStep.bookAbbreviation,
        currentStep.startChapter
      );
    },
    enabled: Boolean(bibleId && currentStep?.bookAbbreviation && currentStep?.startChapter),
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

  // Handle completing current step and moving to next
  const handleCompleteStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      const nextStep = steps[currentStepIndex + 1];
      setCurrentStepIndex(currentStepIndex + 1);
      updateStepMutation.mutate(nextStep.id);
    }
  };

  // Handle going to previous step
  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      const prevStep = steps[currentStepIndex - 1];
      setCurrentStepIndex(currentStepIndex - 1);
      updateStepMutation.mutate(prevStep.id);
    }
  };

  // Handle clicking on a step in the sidebar
  const handleStepClick = (index: number) => {
    if (index !== currentStepIndex) {
      setCurrentStepIndex(index);
      updateStepMutation.mutate(steps[index].id);
    }
  };

  const isLastStep = currentStepIndex === totalSteps - 1;
  const isFirstStep = currentStepIndex === 0;

  // Format bible reference for current step (use full book name when available)
  const currentReference = formatBibleReference(currentStep, chapterData?.bookName);

  return (
    <AppShell>
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
                    const isCompleted = index < currentStepIndex;
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
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
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
                {currentReference && (
                  <>
                    <span className="mx-1">•</span>
                    <span className="font-medium text-foreground">
                      {currentReference}
                    </span>
                  </>
                )}
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

          {/* Scripture content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-4 md:p-6">
              {isChapterLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-pulse text-muted-foreground">{t("common.loading")}</div>
                </div>
              ) : chapterData?.verses && chapterData.verses.length > 0 ? (
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  {currentReference && (
                    <div className="mb-6 pb-4 border-b">
                      <h2 className="text-2xl md:text-3xl font-serif font-semibold text-center text-foreground">
                        {currentReference}
                      </h2>
                    </div>
                  )}
                  <div className="space-y-4">
                    {chapterData.verses.map((verse) => {
                      // Determine if this verse is in the highlighted range
                      const hasVerseRange = currentStep?.startVerse != null;
                      const startV = currentStep?.startVerse ?? 1;
                      const endV = currentStep?.endVerse ?? startV;
                      const isHighlighted = !hasVerseRange ||
                        (verse.verseNumber >= startV && verse.verseNumber <= endV);

                      return (
                        <p
                          key={verse.id}
                          className={cn(
                            "leading-relaxed text-base md:text-lg transition-opacity",
                            !isHighlighted && "opacity-30"
                          )}
                        >
                          <sup className={cn(
                            "text-xs font-semibold mr-1.5 select-none",
                            isHighlighted ? "text-primary" : "text-muted-foreground"
                          )}>
                            {verse.verseNumber}
                          </sup>
                          <span className={isHighlighted ? "text-foreground" : "text-muted-foreground"}>
                            {verse.content}
                          </span>
                        </p>
                      );
                    })}
                  </div>
                </div>
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
              <Button
                variant="outline"
                onClick={handlePreviousStep}
                disabled={isFirstStep || updateStepMutation.isPending}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{t("common.previous")}</span>
              </Button>

              <div className="flex items-center gap-2">
                <Progress value={progress} className="w-24 h-2 hidden sm:block" />
                <span className="text-sm text-muted-foreground">
                  {currentStepIndex + 1} / {totalSteps}
                </span>
              </div>

              {isLastStep ? (
                <Button
                  onClick={() => router.push("/session")}
                  className="bg-primary hover:bg-primary/90"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">{t("session.finishStudy")}</span>
                  <span className="sm:hidden">Finish</span>
                </Button>
              ) : (
                <Button
                  onClick={handleCompleteStep}
                  disabled={updateStepMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  <span className="hidden sm:inline">{t("session.markComplete")}</span>
                  <span className="sm:hidden">Next</span>
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </footer>
        </main>
      </div>
    </AppShell>
  );
}
