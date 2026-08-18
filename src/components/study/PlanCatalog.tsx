"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import posthog from "posthog-js";
import { BookOpenCheck, Layers, Library, Play } from "lucide-react";

import { globalStudyListSS } from "@/app/common/study/service/server/globalStudyListSS";
import { studyAdoptSS } from "@/app/common/study/service/server/studyAdoptSS";
import { bibleGetAllSS } from "@/app/common/bible/service/bibleGetAllSS";
import { userSetDefaultBibleSS } from "@/app/common/user/service/server/userSetDefaultBibleSS";
import { GlobalStudyCard } from "@/app/common/study/model/Study";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { recommendedSlugForLocale } from "@/lib/recommendedBible";
import { logger } from "@/app/utils/logger";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { BibleSelector } from "@/components/app";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * The global catalog, shown above the reader's own studies.
 *
 * A plan is adopted rather than opened: taking one copies it into the reader's
 * account in their translation and starts a session on the copy (studyAdoptSS),
 * which is why the button needs a Bible before it can do anything. A plan the
 * reader already has says "Continue" and goes straight to their session.
 */
export function PlanCatalog() {
  const t = useTranslations("study.plans");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: loggedUser, isPremium } = useLoggedUserContext();

  const [planToStart, setPlanToStart] = useState<GlobalStudyCard | null>(null);
  const [bibleId, setBibleId] = useState("");

  const { data: plans, isLoading } = useQuery({
    queryKey: ["globalStudies", loggedUser?.id],
    queryFn: async () => await globalStudyListSS(),
    enabled: isPremium,
  });

  // Only fetched once the reader actually opens the picker — the catalog itself
  // does not need the 400-row translation list.
  const { data: bibles, isLoading: biblesLoading } = useQuery({
    queryKey: ["bibles"],
    queryFn: async () => await bibleGetAllSS(),
    enabled: Boolean(planToStart),
  });

  /*
   * Preselect a translation the same way the create-study form does: a stored
   * preference is a real choice and beats the language default, which is only
   * our best guess. Never overrides a pick already made in this dialog.
   */
  useEffect(() => {
    if (!bibles?.length || bibleId) return;
    const stored = loggedUser?.defaultBibleId
      ? bibles.find((b) => b.id === loggedUser.defaultBibleId)
      : undefined;
    const match =
      stored ??
      bibles.find((b) => b.slug === recommendedSlugForLocale(locale)) ??
      bibles.find((b) => b.slug === "bsb-en");
    if (match) setBibleId(match.id);
  }, [bibles, bibleId, locale, loggedUser?.defaultBibleId]);

  const adoptMutation = useMutation({
    mutationFn: async (plan: GlobalStudyCard) => await studyAdoptSS(plan.slug, bibleId || undefined),
    onSuccess: (result, plan) => {
      posthog.capture("global_study_adopted", { slug: plan.slug, created: result.created });
      queryClient.invalidateQueries({ queryKey: ["globalStudies"] });
      queryClient.invalidateQueries({ queryKey: ["studies"] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      setPlanToStart(null);
      router.push(`/session/${result.sessionId}`);
    },
    onError: (e) => {
      logger.error(e);
      toast.error(tCommon("error"));
    },
  });

  function onStart(plan: GlobalStudyCard) {
    // Already taken: no translation to ask about, just go back to the session.
    if (plan.adopted?.sessionId) {
      router.push(`/session/${plan.adopted.sessionId}`);
      return;
    }
    setPlanToStart(plan);
  }

  if (!isPremium) return null;
  if (isLoading || !plans?.length) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-3">
        <Library className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">{t("title")}</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{t("subtitle")}</p>

      <div className="space-y-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="rounded-lg border border-primary/30 bg-primary/5 p-6 hover:border-primary/60 transition-colors"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="text-muted-foreground mt-1">{plan.description}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" />
                    {t("readings", { count: plan.stepCount })}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpenCheck className="h-3.5 w-3.5" />
                    {t("coverage", { chapters: plan.chapterCount, books: plan.bookCount })}
                  </span>
                </div>
              </div>
              <Button
                onClick={() => onStart(plan)}
                disabled={adoptMutation.isPending}
                className="bg-primary hover:bg-primary/90 flex-shrink-0"
              >
                <Play className="mr-2 h-4 w-4" />
                {plan.adopted ? t("continue") : t("start")}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={Boolean(planToStart)} onOpenChange={(open) => !open && setPlanToStart(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{planToStart?.name}</DialogTitle>
            <DialogDescription>{t("chooseBible")}</DialogDescription>
          </DialogHeader>

          <BibleSelector
            bibles={bibles}
            value={bibleId}
            onValueChange={(value) => {
              setBibleId(value);
              // An explicit pick is the strongest signal we get about which
              // translation this reader wants, here as in the create form.
              void userSetDefaultBibleSS(value);
            }}
            disabled={biblesLoading}
            isLoading={biblesLoading}
          />
          <p className="text-xs text-muted-foreground">{t("bibleHint")}</p>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setPlanToStart(null)}>
              {tCommon("cancel")}
            </Button>
            <Button
              onClick={() => planToStart && adoptMutation.mutate(planToStart)}
              disabled={!bibleId || adoptMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {adoptMutation.isPending ? t("starting") : t("start")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
