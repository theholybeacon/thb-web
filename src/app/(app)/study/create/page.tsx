"use client";

import { StudyInsert } from "@/app/common/study/model/Study";
import { studyCreateWithAISS } from "@/app/common/study/service/server/studyCreateWithAISS";
import { bibleGetAllSS } from "@/app/common/bible/service/bibleGetAllSS";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppShell, BibleSelector } from "@/components/app";
import Link from "next/link";
import { ArrowLeft, Users, Sparkles, BookOpen } from "lucide-react";

export default function CreateStudyPage() {
  const t = useTranslations("createStudy");
  const { user: loggedUser } = useLoggedUserContext();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    length: 5,
    depth: 5,
    topic: "",
    bibleId: "",
  });

  // Fetch available Bibles
  const { data: bibles, isLoading: biblesLoading } = useQuery({
    queryKey: ["bibles"],
    queryFn: async () => {
      return await bibleGetAllSS();
    },
  });

  const createProgramMutation = useMutation({
    mutationFn: async () => {
      if (!loggedUser?.id) throw new Error("User not logged in");
      if (!formData.bibleId) throw new Error("Please select a Bible translation");
      const studyInsert: StudyInsert = {
        name: formData.name,
        description: formData.description,
        topic: formData.topic,
        ownerId: loggedUser.id,
        length: formData.length,
        depth: formData.depth,
      };
      return await studyCreateWithAISS(studyInsert, formData.bibleId);
    },
    onSuccess: () => {
      router.push("/study");
    },
    onError: (error) => {
      console.error("Error creating study:", error);
    },
  });

  function onSubmitHandler(e: React.FormEvent) {
    e.preventDefault();
    createProgramMutation.mutate();
  }

  return (
    <AppShell>
      <div className="p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/study"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("backToStudies")}
          </Link>

          <h1 className="text-3xl font-bold text-center mb-8">{t("title")}</h1>

          <form onSubmit={onSubmitHandler} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t("name")}</Label>
              <Input
                id="name"
                placeholder={t("namePlaceholder")}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <Label>{t("bibleTranslation")}</Label>
              </div>
              <BibleSelector
                bibles={bibles}
                value={formData.bibleId}
                onValueChange={(value) => setFormData({ ...formData, bibleId: value })}
                disabled={biblesLoading}
                isLoading={biblesLoading}
              />
              <p className="text-xs text-muted-foreground">
                {t("bibleHint")}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="description">{t("description")}</Label>
              </div>
              <Textarea
                id="description"
                placeholder={t("descriptionPlaceholder")}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {t("descriptionHint")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="length">{t("length")}: {formData.length}</Label>
              <input
                type="range"
                id="length"
                min={1}
                max={10}
                value={formData.length}
                onChange={(e) => setFormData({ ...formData, length: Number(e.target.value) })}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t("lengthShort")}</span>
                <span>{t("lengthMedium")}</span>
                <span>{t("lengthLong")}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="depth">{t("depth")}: {formData.depth}</Label>
              <input
                type="range"
                id="depth"
                min={1}
                max={10}
                value={formData.depth}
                onChange={(e) => setFormData({ ...formData, depth: Number(e.target.value) })}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t("depthShallow")}</span>
                <span>{t("depthDeep")}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <Label htmlFor="topic">{t("topic")}</Label>
              </div>
              <Textarea
                id="topic"
                placeholder={t("topicPlaceholder")}
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                rows={4}
                className="border-primary/30 focus-visible:ring-primary/50"
              />
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-primary">{t("topicHint")}</span> {t("topicExamples")}
                </p>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={createProgramMutation.isPending}
            >
              {createProgramMutation.isPending ? t("creating") : t("create")}
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
