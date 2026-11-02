"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { track } from "@/lib/analytics";
import { BookOpenCheck, Feather, Languages, Layers, Library, Play, PlayCircle, Search } from "lucide-react";

import { globalStudyListSS } from "@/app/common/study/service/server/globalStudyListSS";
import { studyAdoptSS } from "@/app/common/study/service/server/studyAdoptSS";
import { bibleGetAllSS } from "@/app/common/bible/service/bibleGetAllSS";
import { userSetDefaultBibleSS } from "@/app/common/user/service/server/userSetDefaultBibleSS";
import { GlobalStudyCard } from "@/app/common/study/model/Study";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { pickDefaultBible } from "@/lib/bibleFollowsLanguage";
import { useBibleFollowsLanguage } from "@/components/app/useBibleFollowsLanguage";
import { languageNameToIso } from "@/lib/bibleLanguage";
import { HOLY_BEACON_CREATOR } from "@/app/common/study/model/StudyKind";
import {
  ALL_LANGUAGES,
  CatalogFilter,
  catalogLanguages,
  defaultCatalogLanguage,
  filterCatalog,
  filterCatalogExceptKind,
} from "@/app/common/study/model/catalogFilter";
import { commonsThumbnail } from "@/lib/commonsThumbnail";
import { STEP_KINDS } from "@/app/common/studyStep/model/StepContent";
import { StepKindIcon } from "./steps/StepKindIcon";
import { cn } from "@/lib/utils";
import { logger } from "@/app/utils/logger";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BibleSelector } from "@/components/app";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** No filter: the language is left empty so the catalog follows the app language. */
const EMPTY_FILTER: CatalogFilter = { kind: "all", language: "", testament: "all", query: "", inProgress: false };

/**
 * The global catalog, shown above the reader's own studies: The Holy Beacon's
 * reading plans and its stories, searchable and filterable by kind, language,
 * testament and what the reader has started. Plans come first as wide cards;
 * stories follow in a grid with their first picture, grouped by testament.
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
  const [followsLanguage] = useBibleFollowsLanguage();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: loggedUser, isPremium } = useLoggedUserContext();

  const [planToStart, setPlanToStart] = useState<GlobalStudyCard | null>(null);
  const [bibleId, setBibleId] = useState("");
  const [filter, setFilter] = useState<CatalogFilter>(EMPTY_FILTER);

  const { data: plans, isLoading } = useQuery({
    queryKey: ["globalStudies", loggedUser?.id],
    queryFn: async () => await globalStudyListSS(),
    enabled: isPremium,
  });

  // Only fetched once the reader actually opens the picker — the catalog itself
  // does not need the 400-row translation list.
  const { data: allBibles, isLoading: biblesLoading } = useQuery({
    queryKey: ["bibles"],
    queryFn: async () => await bibleGetAllSS(),
    enabled: Boolean(planToStart),
  });

  // A study is written in one language, so it is read in a translation of that
  // language: its text steps sit between the passages (studyAdoptSS enforces it).
  const bibles = planToStart
    ? allBibles?.filter((b) => languageNameToIso(b.language) === planToStart.language)
    : allBibles;

  /*
   * Preselect a translation the same way the create-study form does: a stored
   * preference is a real choice and beats the language default, which is only
   * our best guess, unless it is in another language and the Bible follows the
   * language (src/lib/bibleFollowsLanguage.ts). Never overrides a pick already
   * made in this dialog.
   */
  useEffect(() => {
    if (!bibles?.length) return;
    if (bibleId && bibles.some((b) => b.id === bibleId)) return;
    const match = pickDefaultBible(bibles, {
      storedId: loggedUser?.defaultBibleId,
      // The list is the plan's language: that is the language the Bible follows here.
      locale: planToStart?.language ?? locale,
      followsLanguage,
    });
    if (match) setBibleId(match.id);
  }, [bibles, bibleId, locale, planToStart?.language, loggedUser?.defaultBibleId, followsLanguage]);

  const adoptMutation = useMutation({
    mutationFn: async (plan: GlobalStudyCard) => await studyAdoptSS(plan.slug, bibleId || undefined),
    onSuccess: (result, plan) => {
      track("global_study_adopted", { slug: plan.slug, kind: plan.kind, created: result.created });
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

  // Until the reader picks one, the catalog follows the app language.
  const current: CatalogFilter = { ...filter, language: filter.language || defaultCatalogLanguage(plans, locale) };
  const languages = catalogLanguages(plans);
  const unfilteredByKind = filterCatalogExceptKind(plans, current);
  const counts = { all: unfilteredByKind.length, plan: 0, story: 0 };
  for (const plan of unfilteredByKind) counts[plan.kind]++;
  const shown = filterCatalog(plans, current);
  const shownPlans = shown.filter((plan) => plan.kind === "plan");
  const storyGroups = (["OT", "NT"] as const)
    .map((testament) => ({ testament, stories: shown.filter((plan) => plan.kind === "story" && plan.testament === testament) }))
    .filter((group) => group.stories.length);
  const hasStories = plans.some((plan) => plan.kind === "story");
  const inProgressCount = plans.filter((plan) => plan.adopted).length;
  const update = (change: Partial<CatalogFilter>) => setFilter((previous) => ({ ...previous, language: current.language, ...change }));

  return (
    <section className="mb-10" aria-labelledby="catalog-title">
      <div className="flex items-center gap-2 mb-3">
        <Library className="h-5 w-5 text-primary" />
        <h2 id="catalog-title" className="text-xl font-semibold">{t("title")}</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{t("subtitle")}</p>

      <div className="mb-6 space-y-3 rounded-lg border bg-muted/20 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={filter.query}
            onChange={(event) => update({ query: event.target.value })}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasStories && (
            <div role="tablist" aria-label={t("filterLabel")} className="inline-flex rounded-lg border bg-muted/40 p-1">
              {(["all", "plan", "story"] as const).map((key) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={current.kind === key}
                  onClick={() => update({ kind: key })}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    current.kind === key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t(`filter_${key}` as "filter_all", { count: counts[key] })}
                </button>
              ))}
            </div>
          )}

          {languages.length > 1 && (
            <Chips
              label={t("languageLabel")}
              icon={<Languages className="h-4 w-4" />}
              value={current.language}
              onChange={(language) => update({ language })}
              options={[
                ...languages.map((code) => ({ value: code, label: languageName(code, locale) })),
                { value: ALL_LANGUAGES, label: t("language_all") },
              ]}
            />
          )}

          {hasStories && current.kind !== "plan" && (
            <Chips
              label={t("testamentLabel")}
              value={current.testament}
              onChange={(testament) => update({ testament: testament as CatalogFilter["testament"] })}
              options={(["all", "OT", "NT"] as const).map((key) => ({ value: key, label: t(`testament_${key}` as "testament_all") }))}
            />
          )}

          {inProgressCount > 0 && (
            <button
              type="button"
              aria-pressed={current.inProgress}
              onClick={() => update({ inProgress: !current.inProgress })}
              className={chipClass(current.inProgress)}
            >
              <PlayCircle className="h-3.5 w-3.5" />
              {t("inProgress", { count: inProgressCount })}
            </button>
          )}
        </div>
      </div>

      {shown.length === 0 && (
        <div className="rounded-lg border border-dashed py-10 text-center">
          <p className="text-muted-foreground mb-3">{t("noMatches")}</p>
          <Button variant="outline" onClick={() => setFilter(EMPTY_FILTER)}>{t("clearFilters")}</Button>
        </div>
      )}

      {shownPlans.length > 0 && (
        <CatalogGroup title={t("plansHeading")} count={shownPlans.length}>
          <div className="grid gap-4 md:grid-cols-2">
            {shownPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onStart={onStart} disabled={adoptMutation.isPending} />
            ))}
          </div>
        </CatalogGroup>
      )}

      {storyGroups.map((group) => (
        <CatalogGroup key={group.testament} title={t(`stories_${group.testament}`)} count={group.stories.length}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.stories.map((story) => (
              <StoryCard key={story.id} story={story} onStart={onStart} disabled={adoptMutation.isPending} />
            ))}
          </div>
        </CatalogGroup>
      ))}

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
              void userSetDefaultBibleSS(value).then(() =>
                track("default_bible_set", { bibleId: value, source: "plan_catalog" })
              );
            }}
            disabled={biblesLoading}
            isLoading={biblesLoading}
          />
          <p className="text-xs text-muted-foreground">
            {planToStart && t("chooseBibleLanguage", { language: languageName(planToStart.language, locale) })}{" "}
            {t("bibleHint")}
          </p>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setPlanToStart(null)}>
              {tCommon("cancel")}
            </Button>
            <Button
              onClick={() => planToStart && adoptMutation.mutate(planToStart)}
              disabled={!bibleId || adoptMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {adoptMutation.isPending ? t("starting") : planToStart?.kind === "story" ? t("startStory") : t("start")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

/** "English", "inglés": a study's language, named in the reader's own. */
function languageName(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: "language" }).of(code) ?? code;
  } catch {
    return code;
  }
}

function chipClass(active: boolean): string {
  return cn(
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
    active ? "border-primary bg-primary/15 text-primary" : "bg-background text-muted-foreground hover:text-foreground",
  );
}

/** A labelled row of single-choice chips. */
function Chips({ label, icon, value, onChange, options }: {
  label: string;
  icon?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex flex-wrap items-center gap-1.5">
      {icon && <span className="text-muted-foreground" aria-hidden>{icon}</span>}
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={chipClass(value === option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function CatalogGroup({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="mb-3 flex items-baseline gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
        <span className="font-normal normal-case tracking-normal">({count})</span>
      </h3>
      {children}
    </div>
  );
}

type CardProps = { onStart: (plan: GlobalStudyCard) => void; disabled: boolean };

/** Kind, creator and, once taken, "Started". */
function CardByline({ plan }: { plan: GlobalStudyCard }) {
  const t = useTranslations("study.plans");
  const tStudy = useTranslations("study");
  return (
    <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 font-medium text-primary">
        {plan.kind === "story" ? <Feather className="h-3 w-3" /> : <Layers className="h-3 w-3" />}
        {tStudy(`kind.${plan.kind}` as never)}
      </span>
      <span className="text-muted-foreground">
        {tStudy("by", { name: plan.creatorName ?? HOLY_BEACON_CREATOR })}
      </span>
      {plan.adopted && (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 font-medium text-emerald-700 dark:text-emerald-400">
          <PlayCircle className="h-3 w-3" />
          {t("started")}
        </span>
      )}
    </div>
  );
}

function StartButton({ plan, onStart, disabled, className }: CardProps & { plan: GlobalStudyCard; className?: string }) {
  const t = useTranslations("study.plans");
  return (
    <Button onClick={() => onStart(plan)} disabled={disabled} className={cn("bg-primary hover:bg-primary/90", className)}>
      <Play className="mr-2 h-4 w-4" />
      {plan.adopted ? t("continue") : plan.kind === "story" ? t("startStory") : t("start")}
    </Button>
  );
}

function PlanCard({ plan, ...props }: CardProps & { plan: GlobalStudyCard }) {
  const t = useTranslations("study.plans");
  return (
    <div
      data-testid="catalog-card"
      className="flex flex-col rounded-lg border border-primary/30 bg-primary/5 p-5 hover:border-primary/60 transition-colors"
    >
      <CardByline plan={plan} />
      <h4 className="text-lg font-semibold">{plan.name}</h4>
      <p className="text-sm text-muted-foreground mt-1 flex-1">{plan.description}</p>
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
      <StartButton plan={plan} {...props} className="mt-4 self-start" />
    </div>
  );
}

function StoryCard({ story, ...props }: CardProps & { story: GlobalStudyCard }) {
  const tStudy = useTranslations("study");
  return (
    <div
      data-testid="catalog-card"
      className="group flex flex-col overflow-hidden rounded-lg border bg-card hover:border-primary/60 hover:shadow-md transition"
    >
      <CoverImage image={story.coverImage} />
      <div className="flex flex-1 flex-col p-4">
        <CardByline plan={story} />
        <h4 className="text-lg font-semibold leading-snug">{story.name}</h4>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-3 flex-1">{story.description}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" />
            {tStudy("steps", { count: story.stepCount })}
          </span>
          {STEP_KINDS.filter((kind) => story.stepKinds[kind]).map((kind) => (
            <span key={kind} className="inline-flex items-center gap-1">
              <StepKindIcon kind={kind} />
              {tStudy(`stepKindCount.${kind}` as "stepKindCount.text", { count: story.stepKinds[kind] ?? 0 })}
            </span>
          ))}
        </div>
        <StartButton plan={story} {...props} className="mt-4 w-full" />
      </div>
    </div>
  );
}

/**
 * The story's first picture, at card size. Falls back to the full image if
 * Commons has no rendition at that width (a file narrower than it), and to a
 * plain panel when the story has no picture at all.
 */
function CoverImage({ image }: { image: GlobalStudyCard["coverImage"] }) {
  const [src, setSrc] = useState(image ? commonsThumbnail(image.url) : null);
  if (!image || !src) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center bg-primary/10 text-primary/60">
        <Feather className="h-8 w-8" />
      </div>
    );
  }
  return (
    <div className="aspect-[16/9] overflow-hidden bg-muted">
      {/* A plain img, as in the image step: public-domain art from Wikimedia Commons. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={image.alt}
        loading="lazy"
        onError={() => setSrc(src === image.url ? null : image.url)}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
    </div>
  );
}
