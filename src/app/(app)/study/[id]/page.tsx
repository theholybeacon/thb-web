"use client";

import { useRouter } from "next/navigation";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { track } from "@/lib/analytics";
import { useTranslations } from "next-intl";
import { studyGetByIdSS } from "@/app/common/study/service/server/studyGetByIdSS";
import { studyDeleteSS } from "@/app/common/study/service/server/studyDeleteSS";
import { studyRegenerateSaveSS } from "@/app/common/study/service/server/studyRegenerateSaveSS";
import { sessionCreateSS } from "@/app/common/session/service/sessionCreateSS";
import { logger } from "@/app/utils/logger";
import { SessionInsert } from "@/app/common/session/model/Session";
import { StudyStep } from "@/app/common/studyStep/model/StudyStep";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Play,
  Trash2,
  RefreshCw,
  Circle,
  Clock,
  Layers,
  Pencil,
  Sparkles,
  BookOpen,
  Library,
} from "lucide-react";
import { useState, use } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { PremiumGate } from "@/components/premium";
import { StudyByline } from "@/components/study";
import { StepKindIcon } from "@/components/study/steps/StepKindIcon";
import { studyIsOnlyPassages } from "@/app/common/studyStep/model/StepContent";

// Helper function to format bible reference using canonical fields
function formatBibleReference(step: StudyStep): string {
  // Only a passage has a reference; a reflection's anchor is where its note goes.
  if (step.kind !== "scripture") return "";
  const bookAbbr = step.bookAbbreviation;
  if (!bookAbbr) return "";

  const startChapter = step.startChapter;
  const endChapter = step.endChapter;
  const startVerse = step.startVerse;
  const endVerse = step.endVerse;

  if (!startChapter) {
    return bookAbbr;
  }

  if (startVerse && endVerse && startVerse !== endVerse) {
    return `${bookAbbr} ${startChapter}:${startVerse}-${endVerse}`;
  }

  if (startVerse) {
    return `${bookAbbr} ${startChapter}:${startVerse}`;
  }

  if (endChapter && endChapter !== startChapter) {
    return `${bookAbbr} ${startChapter}-${endChapter}`;
  }

  return `${bookAbbr} ${startChapter}`;
}

export default function StudyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("study");
  const tBuilder = useTranslations("studyBuilder");
  const tPlans = useTranslations("study.plans");
  const tCommon = useTranslations("common");
  const { user: loggedUser, loading: userLoading, isPremium } = useLoggedUserContext();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);

  const { data: study, isLoading, isError } = useQuery({
    queryKey: ["study", id],
    queryFn: async () => {
      return await studyGetByIdSS(id);
    },
    enabled: Boolean(id) && isPremium,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await studyDeleteSS(id);
    },
    onSuccess: () => {
      track("study_deleted", { studyId: id, source: "study_detail" });
      queryClient.invalidateQueries({ queryKey: ["studies"] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success(t("deleteStudy"));
      router.push("/study");
    },
    onError: (e) => {
      logger.error(e);
      toast.error(tCommon("error"));
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: async () => {
      // Phase 1: Generate AI steps (edge runtime, 25s limit)
      const res = await fetch('/api/study/regenerate-steps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studyId: id }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to regenerate study steps');
      }
      const steps = await res.json();

      // Phase 2: Delete old + save new (server action, fast)
      return await studyRegenerateSaveSS(id, steps);
    },
    onSuccess: (newStudy) => {
      track("study_regenerated", { studyId: id, stepCount: newStudy?.steps?.length });
      // Update the cache with the new study data immediately
      queryClient.setQueryData(["study", id], newStudy);
      queryClient.invalidateQueries({ queryKey: ["studies"] });
      setRegenerateDialogOpen(false);
      toast.success(t("regenerated"));
    },
    onError: (e) => {
      logger.error(e);
      toast.error(tCommon("error"));
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: async () => {
      if (!loggedUser?.id || !study?.steps?.[0]) throw new Error("Cannot create session");
      const sessionInsert: SessionInsert = {
        studyId: study.id,
        currentStepId: study.steps[0].id,
        userId: loggedUser.id,
      };
      return await sessionCreateSS(sessionInsert);
    },
    onSuccess: (session) => {
      track("session_started", { studyId: study?.id, sessionId: session.id, source: "study_detail" });
      toast.success(t("startSession"));
      router.push(`/session/${session.id}`);
    },
    onError: (e) => {
      logger.error(e);
      toast.error(tCommon("error"));
    },
  });

  if (userLoading || isLoading) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center py-20">
          <div className="animate-pulse">{tCommon("loading")}</div>
        </div>
      </AppShell>
    );
  }

  if (isError || !study) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center py-20">
          <div className="text-center">
            <p className="text-destructive mb-4">{t("errorLoading")}</p>
            <Link href="/study">
              <Button variant="outline">{t("backToStudies")}</Button>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PremiumGate>
        <div className="p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/study">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{t("studyDetails")}</h1>
              <div className="mt-1">
                <StudyByline
                  kind={study.kind}
                  creatorId={study.creatorId}
                  creator={study.creator}
                  currentUserId={loggedUser?.id}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* An adopted plan's steps are authored, not generated — regenerating
                  would quietly replace a curated reading order with AI output. */}
              {!study.sourceStudyId && (
                <Button
                  variant="outline"
                  onClick={() => setRegenerateDialogOpen(true)}
                  disabled={regenerateMutation.isPending}
                >
                  <RefreshCw className={cn("mr-2 h-4 w-4", regenerateMutation.isPending && "animate-spin")} />
                  <span className="hidden sm:inline">
                    {regenerateMutation.isPending ? t("regenerating") : t("regenerate")}
                  </span>
                </Button>
              )}
              <Button
                onClick={() => createSessionMutation.mutate()}
                disabled={createSessionMutation.isPending || !study.steps?.length}
                className="bg-primary hover:bg-primary/90"
              >
                <Play className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{t("startSession")}</span>
              </Button>
            </div>
          </div>

          {/* Study Info Card — editing happens in the builder, by hand or with the AI */}
          <div className="rounded-lg border bg-card p-6 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                {study.sourceStudyId && (
                  <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                    <Library className="h-3 w-3" />
                    {tPlans("fromCatalog")}
                  </span>
                )}
                <h2 className="text-2xl font-semibold" data-testid="study-name">{study.name}</h2>
                {study.description && <p className="mt-1 text-muted-foreground">{study.description}</p>}
              </div>
              {/* The builder edits passages only; a study with text, images or
                  reflections would lose them there (studyBuilderSS refuses it). */}
              {studyIsOnlyPassages(study.steps ?? []) && (
                <Button variant="outline" asChild className="shrink-0">
                  <Link href={`/study/${study.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {t("editStudy")}
                  </Link>
                </Button>
              )}
            </div>
            {study.topic && (
              <p className="mt-4 flex items-start gap-2 text-sm">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{study.topic}</span>
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                <Clock className="h-3 w-3" /> {tBuilder(`lengths.${Math.min(10, Math.max(1, study.length))}`)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                <Layers className="h-3 w-3" /> {tBuilder("depthValue", { depth: study.depth })}
              </span>
              {study.bible && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
                  <BookOpen className="h-3 w-3" /> {study.bible.name}
                </span>
              )}
            </div>
          </div>

          {/* Steps List */}
          <div className="rounded-lg border bg-card p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {t("steps", { count: study.steps?.length || 0 })}
            </h2>
            <div className="space-y-3">
              {study.steps?.map((step, index) => {
                const reference = formatBibleReference(step);

                return (
                  <div
                    key={step.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-background"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">
                        Step {index + 1}: {step.title}
                      </p>
                      {reference ? (
                        <div className="flex items-center gap-1.5 mt-1 text-sm text-primary">
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>{reference}</span>
                        </div>
                      ) : step.kind !== "scripture" && (
                        <div className="flex items-center gap-1.5 mt-1 text-sm text-primary">
                          <StepKindIcon kind={step.kind} />
                          <span>{t(`stepKinds.${step.kind}` as "stepKinds.text")}</span>
                        </div>
                      )}
                      {step.explanation && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {step.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              {(!study.steps || study.steps.length === 0) && (
                <p className="text-muted-foreground text-center py-4">
                  No steps yet. Click &quot;Regenerate Steps&quot; to create them.
                </p>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-lg border border-destructive/50 bg-card p-6">
            <h2 className="text-xl font-semibold text-destructive mb-4">Danger Zone</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t("deleteStudy")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("deleteConfirm")}
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("deleteStudy")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteStudy")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteConfirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? tCommon("loading") : tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Regenerate Dialog */}
      <AlertDialog open={regenerateDialogOpen} onOpenChange={setRegenerateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("regenerate")}</AlertDialogTitle>
            <AlertDialogDescription>{t("regenerateConfirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => regenerateMutation.mutate()}
              className="bg-primary hover:bg-primary/90"
              disabled={regenerateMutation.isPending}
            >
              {regenerateMutation.isPending ? t("regenerating") : t("regenerate")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </PremiumGate>
    </AppShell>
  );
}
