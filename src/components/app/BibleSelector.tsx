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

// Map locale codes to language names used in the Bible API
const localeToLanguage: Record<string, string[]> = {
  en: ["English", "Inglés"],
  es: ["Spanish", "Español", "Castellano"],
  pt: ["Portuguese", "Português"],
  fr: ["French", "Français"],
  de: ["German", "Deutsch"],
  it: ["Italian", "Italiano"],
  zh: ["Chinese", "中文"],
  ko: ["Korean", "한국어"],
  ja: ["Japanese", "日本語"],
  ar: ["Arabic", "العربية"],
  ru: ["Russian", "Русский"],
};

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

  // Sort and filter bibles
  const { priorityBibles, otherBibles } = useMemo(() => {
    if (!bibles) return { priorityBibles: [], otherBibles: [] };

    const userLanguages = localeToLanguage[locale] || localeToLanguage["en"];

    // Filter by search term
    const filtered = search
      ? bibles.filter((bible) => {
          const searchLower = search.toLowerCase();
          return (
            bible.name.toLowerCase().includes(searchLower) ||
            bible.language.toLowerCase().includes(searchLower) ||
            bible.version?.toLowerCase().includes(searchLower)
          );
        })
      : bibles;

    // Separate priority (user's language) from others
    const priority: Bible[] = [];
    const others: Bible[] = [];

    filtered.forEach((bible) => {
      const isUserLanguage = userLanguages.some((lang) =>
        bible.language.toLowerCase().includes(lang.toLowerCase())
      );
      if (isUserLanguage) {
        priority.push(bible);
      } else {
        others.push(bible);
      }
    });

    // Sort each group alphabetically by name
    priority.sort((a, b) => a.name.localeCompare(b.name));
    others.sort((a, b) => a.language.localeCompare(b.language) || a.name.localeCompare(b.name));

    return { priorityBibles: priority, otherBibles: others };
  }, [bibles, locale, search]);

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

            {priorityBibles.length > 0 && (
              <CommandGroup heading={t("recommended")}>
                {priorityBibles.map((bible) => (
                  <BibleOption
                    key={bible.id}
                    bible={bible}
                    selected={value === bible.id}
                    onSelect={handleSelect}
                  />
                ))}
              </CommandGroup>
            )}

            {priorityBibles.length > 0 && otherBibles.length > 0 && (
              <CommandSeparator />
            )}

            {otherBibles.length > 0 && (
              <CommandGroup heading={t("allTranslations")}>
                {otherBibles.map((bible) => (
                  <BibleOption
                    key={bible.id}
                    bible={bible}
                    selected={value === bible.id}
                    onSelect={handleSelect}
                  />
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
