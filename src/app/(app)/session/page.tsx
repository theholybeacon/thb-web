"use client";

import { useRouter } from "next/navigation";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { sessionGetAllByOwnerId } from "@/app/common/session/service/sessionGetAllByOwnerIdSS";
import { sessionDeleteSS } from "@/app/common/session/service/sessionDeleteSS";
import { SessionFull } from "@/app/common/session/model/Session";
import { StudyStep } from "@/app/common/studyStep/model/StudyStep";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import Link from "next/link";
import { Play, MoreVertical, Trash2, BookOpen } from "lucide-react";
import { useState } from "react";
import { logger } from "@/app/utils/logger";
import { toast } from "@/lib/toast";
import { PremiumGate } from "@/components/premium";

// Helper function to format bible reference using canonical fields
function formatBibleReference(step: StudyStep): string {
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

export default function SessionPage() {
  const t = useTranslations("session");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const { user: loggedUser, loading } = useLoggedUserContext();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<SessionFull | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["sessions", loggedUser?.id],
    queryFn: async () => {
      if (!loggedUser?.id) return [];
      return await sessionGetAllByOwnerId(loggedUser.id);
    },
    enabled: Boolean(loggedUser?.id),
  });

  const deleteMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await sessionDeleteSS(sessionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success(t("deleteSession"));
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
    },
    onError: (e) => {
      logger.error(e);
      toast.error(tCommon("error"));
    },
  });

  function handleGoToSession(session: SessionFull) {
    router.push(`/session/${session.id}`);
  }

  const handleDeleteClick = (session: SessionFull) => {
    setSessionToDelete(session);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (sessionToDelete) {
      deleteMutation.mutate(sessionToDelete.id);
    }
  };

  const getProgress = (session: SessionFull) => {
    if (!session.study?.steps?.length) return 0;
    const currentStepIndex = session.study.steps.findIndex(
      (step) => step.id === session.currentStepId
    );
    if (currentStepIndex === -1) return 0;
    return Math.round(((currentStepIndex + 1) / session.study.steps.length) * 100);
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center py-20">
          <div className="animate-pulse">{tCommon("loading")}</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PremiumGate>
        <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <Link href="/study">
              <Button variant="outline">{tNav("browseStudies")}</Button>
            </Link>
          </div>

          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-pulse">{t("loadingSessions")}</div>
            </div>
          )}

          {isError && (
            <div className="text-center py-12 text-destructive">{t("errorLoading")}</div>
          )}

          {!isLoading && !isError && data?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">{t("noSessions")}</p>
              <Link href="/study">
                <Button variant="outline">{t("startStudy")}</Button>
              </Link>
            </div>
          )}

          <div className="space-y-4">
            {data?.map((session) => {
              const progress = getProgress(session);
              return (
                <div
                  key={session.id}
                  className="rounded-lg border bg-card p-6 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-semibold">{session.study.name}</h2>
                      {session.study.description && (
                        <p className="text-muted-foreground mt-1 line-clamp-2">
                          {session.study.description}
                        </p>
                      )}
                      {session.study.steps?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {session.study.steps.slice(0, 5).map((step) => {
                            const reference = formatBibleReference(step);
                            if (!reference) return null;
                            return (
                              <span
                                key={step.id}
                                className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded"
                              >
                                <BookOpen className="h-3 w-3" />
                                {reference}
                              </span>
                            );
                          })}
                          {session.study.steps.length > 5 && (
                            <span className="text-xs text-muted-foreground">
                              +{session.study.steps.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">{t("progress")}</span>
                          <span className="text-primary font-medium">{progress}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden max-w-md">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        onClick={() => handleGoToSession(session)}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">{t("continue")}</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteClick(session)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("deleteSession")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteSession")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteConfirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? tCommon("loading") : tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </PremiumGate>
    </AppShell>
  );
}
