"use client";

import { useState, useMemo, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bible } from "@/app/common/bible/model/Bible";
import { ListenableIndicator } from "@/components/audio/ListenableIndicator";
import {
  recommendedForLanguageCode,
  recommendedBySlug,
  type RecommendedBible,
} from "@/lib/recommendedBible";

interface BibleSelectorProps {
  bibles: Bible[] | undefined;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

interface BibleOptionProps {
  bible: Bible;
  selected: boolean;
  onSelect: (id: string) => void;
}

/**
 * The canon a translation is scoped to ("Protestant", "Catholic", ...), when the
 * description happens to be one.
 *
 * API.Bible lists a translation once per canon, so four rows can share the same
 * name and version and differ only here — without it the picker shows four
 * identical "World English Bible" options. But `description` is free text: it is
 * sometimes a full sentence and sometimes the useless string "Bible", so only
 * short, meaningful values are shown.
 */
function canonLabel(description?: string | null): string | null {
  const d = description?.trim();
  if (!d || d.length > 24 || d.toLowerCase() === "bible") return null;
  return d;
}

/** One row of the picker. Shared by both the "recommended" and "all" groups. */
function BibleOption({ bible, selected, onSelect }: BibleOptionProps) {
  const canon = canonLabel(bible.description);

  return (
    <CommandItem
      value={bible.id}
      onSelect={() => onSelect(bible.id)}
      className="cursor-pointer"
    >
      <Check
        className={cn("mr-2 h-4 w-4", selected ? "opacity-100" : "opacity-0")}
      />
      <div className="flex flex-col">
        <span className="flex items-center gap-1.5">
          {bible.name}
          <ListenableIndicator audioEnabled={bible.audioEnabled} />
        </span>
        <span className="text-xs text-muted-foreground">
          {bible.language}
          {bible.version && ` - ${bible.version}`}
          {canon && ` · ${canon}`}
        </span>
      </div>
    </CommandItem>
  );
}

/**
 * Why this translation, shown under the recommendation.
 *
 * Replaces the old locale -> language-name map, which grouped by language and so
 * put all 36 English rows under a heading that said "Recommended for you" — a
 * list nobody can evaluate, which is the problem this picker had.
 */
function RecommendedNote({ rec }: { rec: RecommendedBible }) {
  return <p className="px-2 pb-1.5 text-xs leading-snug text-muted-foreground">{rec.why}</p>;
}

export function BibleSelector({
  bibles,
  value,
  onValueChange,
  disabled,
  isLoading,
}: BibleSelectorProps) {
  const t = useTranslations("createStudy");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const handleSelect = useCallback(
    (id: string) => {
      onValueChange(id);
      setOpen(false);
    },
    [onValueChange]
  );

  // Get the selected Bible for display
  const selectedBible = useMemo(() => {
    return bibles?.find((bible) => bible.id === value);
  }, [bibles, value]);

  const recommendation = useMemo(() => recommendedForLanguageCode(locale), [locale]);

  /*
   * One recommendation, everything else behind a disclosure.
   *
   * The catalogue is ~404 rows and api.bible lists each translation once per
   * canon, so the honest default is to choose for the reader and keep the rest
   * reachable rather than prominent. Searching opens the full list implicitly —
   * someone typing a translation name has already opted out of the default.
   */
  const { recommendedBible, otherBibles } = useMemo(() => {
    if (!bibles) return { recommendedBible: undefined, otherBibles: [] };

    const recommendedRow = recommendation
      ? bibles.find((b) => b.slug === recommendation.slug)
      : undefined;

    const filtered = search
      ? bibles.filter((bible) => {
          const q = search.toLowerCase();
          return (
            bible.name.toLowerCase().includes(q) ||
            bible.language.toLowerCase().includes(q) ||
            bible.version?.toLowerCase().includes(q)
          );
        })
      : bibles;

    const others = filtered
      .filter((b) => b.id !== recommendedRow?.id)
      .sort(
        (a, b) =>
          a.language.localeCompare(b.language) || a.name.localeCompare(b.name),
      );

    return { recommendedBible: recommendedRow, otherBibles: others };
  }, [bibles, recommendation, search]);

  if (isLoading) {
    return (
      <Button variant="outline" className="w-full justify-between" disabled>
        <span className="text-muted-foreground">{tCommon("loading")}</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedBible ? (
            <span className="truncate">
              {selectedBible.name}{" "}
              <span className="text-muted-foreground">({selectedBible.language})</span>
              {recommendedBySlug(selectedBible.slug) && (
                <span className="ml-1.5 text-xs text-primary">{t("recommendedBadge")}</span>
              )}
            </span>
          ) : (
            <span className="text-muted-foreground">{t("selectBible")}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={t("searchBible")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <CommandList className="max-h-[300px]">
            <CommandEmpty>{t("noBibleFound")}</CommandEmpty>

            {recommendedBible && !search && (
              <>
                <CommandGroup heading={t("recommended")}>
                  <BibleOption
                    bible={recommendedBible}
                    selected={value === recommendedBible.id}
                    onSelect={handleSelect}
                  />
                  {recommendation && <RecommendedNote rec={recommendation} />}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            {otherBibles.length > 0 && (
              <CommandGroup
                heading={
                  search
                    ? t("allTranslations")
                    : `${t("allTranslations")} (${otherBibles.length})`
                }
              >
                {showAll || search ? (
                  otherBibles.map((bible) => (
                    <BibleOption
                      key={bible.id}
                      bible={bible}
                      selected={value === bible.id}
                      onSelect={handleSelect}
                    />
                  ))
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAll(true)}
                    className="w-full px-2 py-2 text-left text-sm text-primary hover:underline"
                  >
                    {t("showAllTranslations", { count: otherBibles.length })}
                  </button>
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
