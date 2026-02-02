"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Bible } from "@/app/common/bible/model/Bible";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, BookOpen, ChevronRight, Globe, ArrowUpDown } from "lucide-react";

interface BibleSelectorProps {
  bibles: Bible[];
}

type SortOption = "name" | "language" | "books";

export function BibleSelector({ bibles }: BibleSelectorProps) {
  const t = useTranslations("bible");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("name");

  // Get unique languages
  const languages = useMemo(() => {
    const langSet = new Set(bibles.map((b) => b.language));
    return Array.from(langSet).sort((a, b) => {
      // Put English and Spanish first
      if (a === "English") return -1;
      if (b === "English") return 1;
      if (a === "Spanish" || a === "Español") return -1;
      if (b === "Spanish" || b === "Español") return 1;
      return a.localeCompare(b);
    });
  }, [bibles]);

  // Filter and sort bibles
  const filteredBibles = useMemo(() => {
    let result = [...bibles];

    // Filter by language
    if (selectedLanguage !== "all") {
      result = result.filter((b) => b.language === selectedLanguage);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
          b.version.toLowerCase().includes(query) ||
          b.description?.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "language":
          return a.language.localeCompare(b.language) || a.name.localeCompare(b.name);
        case "books":
          return (b.numBooks || 0) - (a.numBooks || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [bibles, selectedLanguage, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchBibles")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Language filter */}
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Globe className="h-4 w-4 mr-2" />
            <SelectValue placeholder={t("allLanguages")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allLanguages")}</SelectItem>
            {languages.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">{t("sortName")}</SelectItem>
            <SelectItem value="language">{t("sortLanguage")}</SelectItem>
            <SelectItem value="books">{t("books")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Language tabs (quick filter) */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedLanguage === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedLanguage("all")}
        >
          {t("allLanguages")}
        </Button>
        {languages.slice(0, 6).map((lang) => (
          <Button
            key={lang}
            variant={selectedLanguage === lang ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedLanguage(lang)}
          >
            {lang}
          </Button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filteredBibles.length} {t("translations")}
        {selectedLanguage !== "all" && ` in ${selectedLanguage}`}
      </p>

      {/* Bible grid */}
      {filteredBibles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBibles.map((bible) => (
            <Link
              key={bible.id}
              href={`/bible/${bible.slug}`}
              className="group block p-5 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                    {bible.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span className="font-mono">{bible.version}</span>
                    <span>•</span>
                    <span>{bible.language}</span>
                  </div>
                  {bible.numBooks && bible.numBooks > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {bible.numBooks} {t("books")}
                    </p>
                  )}
                  {bible.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {bible.description}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">{t("noResults")}</p>
        </div>
      )}
    </div>
  );
}
