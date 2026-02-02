"use client";

import { useRouter } from "next/navigation";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { studyGetByIdSS } from "@/app/common/study/service/server/studyGetByIdSS";
import { studyUpdateSS } from "@/app/common/study/service/server/studyUpdateSS";
import { studyDeleteSS } from "@/app/common/study/service/server/studyDeleteSS";
import { studyRegenerateSS } from "@/app/common/study/service/server/studyRegenerateSS";
import { sessionCreateSS } from "@/app/common/session/service/sessionCreateSS";
import { logger } from "@/app/utils/logger";
import { SessionInsert } from "@/app/common/session/model/Session";
import { StudyStep } from "@/app/common/studyStep/model/StudyStep";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
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
  Save,
  Circle,
  Users,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
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

export default function StudyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("study");
  const tCreate = useTranslations("createStudy");
  const tCommon = useTranslations("common");
  const { user: loggedUser, loading: userLoading } = useLoggedUserContext();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("");
  const [length, setLength] = useState(5);
  const [depth, setDepth] = useState(5);

  const { data: study, isLoading, isError } = useQuery({
    queryKey: ["study", id],
    queryFn: async () => {
      return await studyGetByIdSS(id);
    },
    enabled: Boolean(id),
  });

  // Initialize form when study loads
  useEffect(() => {
    if (study) {
      setName(study.name);
      setDescription(study.description || "");
      setTopic(study.topic || "");
      setLength(study.length);
      setDepth(study.depth);
    }
  }, [study]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      await studyUpdateSS(id, {
        name,
        description,
        topic,
        length,
        depth,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study", id] });
      queryClient.invalidateQueries({ queryKey: ["studies"] });
      setIsEditing(false);
      toast.success(t("saved"));
    },
    onError: (e) => {
      logger.error(e);
      toast.error(tCommon("error"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await studyDeleteSS(id);
    },
    onSuccess: () => {
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
      return await studyRegenerateSS(id);
    },
    onSuccess: (newStudy) => {
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
      toast.success(t("startSession"));
      router.push(`/session/${session.id}`);
    },
    onError: (e) => {
      logger.error(e);
      toast.error(tCommon("error"));
    },
  });

  const handleCancelEdit = () => {
    if (study) {
      setName(study.name);
      setDescription(study.description || "");
      setTopic(study.topic || "");
      setLength(study.length);
      setDepth(study.depth);
    }
    setIsEditing(false);
  };

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
            </div>
            <div className="flex items-center gap-2">
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

          {/* Study Info Card */}
          <div className="rounded-lg border bg-card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{t("editStudy")}</h2>
              {!isEditing ? (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  {tCommon("edit")}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={handleCancelEdit}>
                    {tCommon("cancel")}
                  </Button>
                  <Button
                    onClick={() => updateMutation.mutate()}
                    disabled={updateMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {updateMutation.isPending ? t("saving") : t("saveChanges")}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{tCreate("name")}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="description">{tCreate("description")}</Label>
                </div>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={!isEditing}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {tCreate("descriptionHint")}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <Label htmlFor="topic">{tCreate("topic")}</Label>
                </div>
                <Textarea
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={!isEditing}
                  className="border-primary/30 focus-visible:ring-primary/50"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {tCreate("topicHint")}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>{tCreate("length")}</Label>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mt-1 mb-2">
                    <span>{tCreate("lengthShort")}</span>
                    <span>{tCreate("lengthLong")}</span>
                  </div>
                  <Slider
                    value={[length]}
                    onValueChange={([v]: number[]) => setLength(v)}
                    min={1}
                    max={10}
                    step={1}
                    disabled={!isEditing}
                  />
                  <p className="text-sm text-muted-foreground mt-1 text-center">{length}/10</p>
                </div>

                <div>
                  <Label>{tCreate("depth")}</Label>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mt-1 mb-2">
                    <span>{tCreate("depthShallow")}</span>
                    <span>{tCreate("depthDeep")}</span>
                  </div>
                  <Slider
                    value={[depth]}
                    onValueChange={([v]: number[]) => setDepth(v)}
                    min={1}
                    max={10}
                    step={1}
                    disabled={!isEditing}
                  />
                  <p className="text-sm text-muted-foreground mt-1 text-center">{depth}/10</p>
                </div>
              </div>
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
                      {reference && (
                        <div className="flex items-center gap-1.5 mt-1 text-sm text-primary">
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>{reference}</span>
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
    </AppShell>
  );
}
