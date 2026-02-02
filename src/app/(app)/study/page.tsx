"use client";

import { useRouter } from "next/navigation";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { studyGetAllByOwnerIdSS } from "@/app/common/study/service/server/studyGetAllByUserIdSS";
import { studyDeleteSS } from "@/app/common/study/service/server/studyDeleteSS";
import { sessionCreateSS } from "@/app/common/session/service/sessionCreateSS";
import { logger } from "@/app/utils/logger";
import { StudyFullWithBible } from "@/app/common/study/model/Study";
import { StudyStep } from "@/app/common/studyStep/model/StudyStep";
import { SessionInsert } from "@/app/common/session/model/Session";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/app";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { Plus, Play, MoreVertical, Trash2, Eye, BookOpen } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { toast } from "@/lib/toast";

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

export default function StudyPage() {
  const t = useTranslations("study");
  const tCommon = useTranslations("common");
  const { user: loggedUser, loading } = useLoggedUserContext();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studyToDelete, setStudyToDelete] = useState<StudyFullWithBible | null>(null);

  function onCreateHandler() {
    router.push("/study/create");
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ["studies", loggedUser?.id],
    queryFn: async () => {
      if (!loggedUser?.id) return [];
      return await studyGetAllByOwnerIdSS(loggedUser.id);
    },
    enabled: Boolean(loggedUser?.id),
  });

  const createSessionMutation = useMutation({
    mutationFn: async (study: StudyFullWithBible) => {
      if (!loggedUser?.id) throw new Error("User not logged in");
      const sessionInsert: SessionInsert = {
        studyId: study.id,
        currentStepId: study.steps[0].id,
        userId: loggedUser.id,
      };
      return await sessionCreateSS(sessionInsert);
    },
    onSuccess: (session) => {
      toast.success(t("startSession"));
      router.push(`/session/${session.id}`);
    },
    onError: (e) => {
      logger.error(e);
      toast.error(tCommon("error"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (studyId: string) => {
      await studyDeleteSS(studyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studies"] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success(t("deleteStudy"));
      setDeleteDialogOpen(false);
      setStudyToDelete(null);
    },
    onError: (e) => {
      logger.error(e);
      toast.error(tCommon("error"));
    },
  });

  const handleDeleteClick = (study: StudyFullWithBible) => {
    setStudyToDelete(study);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (studyToDelete) {
      deleteMutation.mutate(studyToDelete.id);
    }
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
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <Button onClick={onCreateHandler} className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              {t("createStudy")}
            </Button>
          </div>

          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-pulse">{t("loadingStudies")}</div>
            </div>
          )}

          {isError && (
            <div className="text-center py-12 text-destructive">{t("errorLoading")}</div>
          )}

          {!isLoading && !isError && data?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">{t("noStudies")}</p>
              <Button onClick={onCreateHandler} variant="outline">
                {t("createFirst")}
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {data?.map((study) => (
              <div
                key={study.id}
                className="rounded-lg border bg-card p-6 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <Link href={`/study/${study.id}`} className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold hover:text-primary transition-colors">
                      {study.name}
                    </h2>
                    {study.description && (
                      <p className="text-muted-foreground mt-1 line-clamp-2">
                        {study.description}
                      </p>
                    )}
                    {study.bible && (
                      <p className="text-sm text-primary/80 mt-1">
                        {study.bible.name} ({study.bible.language})
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      {t("steps", { count: study.steps?.length || 0 })}
                    </p>
                    {study.steps?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {study.steps.slice(0, 5).map((step) => {
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
                        {study.steps.length > 5 && (
                          <span className="text-xs text-muted-foreground">
                            +{study.steps.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      onClick={() => createSessionMutation.mutate(study)}
                      disabled={createSessionMutation.isPending || !study.steps?.length}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">{t("startSession")}</span>
                      <span className="sm:hidden">Start</span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/study/${study.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            {t("viewDetails")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteClick(study)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("deleteStudy")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteStudy")}</AlertDialogTitle>
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
    </AppShell>
  );
}
