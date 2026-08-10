"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Verse } from "@/app/common/verse/model/Verse";
import { ChapterMentions } from "@/app/common/entity/model/Entity";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BookOpen, Loader2 } from "lucide-react";
import { ReaderEngine, ReaderMode } from "@/components/reader/ReaderEngine";

interface ExplorerViewProps {
  verses: Verse[];
  bookName: string;
  chapterNumber: number;
  bibleSlug: string;
  bookSlug: string;
  hasPrevChapter: boolean;
  hasNextChapter: boolean;
  nextBook?: { name: string; slug: string } | null;
  mentions?: ChapterMentions;
  isPremium?: boolean;
  /** Needed by Listen mode. Without bibleLanguage the narrator reads Spanish in English. */
  bibleId?: string;
  bibleLanguage?: string;
  bookAbbreviation?: string;
  audioEnabled?: boolean;
}

export function ExplorerView({
  verses,
  bookName,
  chapterNumber,
  bibleSlug,
  bookSlug,
  hasPrevChapter,
  hasNextChapter,
  nextBook,
  mentions,
  isPremium = false,
  bibleId,
  bibleLanguage,
  bookAbbreviation,
  audioEnabled = false,
}: ExplorerViewProps) {
  const t = useTranslations();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentMode, setCurrentMode] = useState<ReaderMode>("read");
  const [navigatingDirection, setNavigatingDirection] = useState<"prev" | "next" | null>(null);

  const handleNavigation = (direction: "prev" | "next") => {
    const targetChapter = direction === "prev" ? chapterNumber - 1 : chapterNumber + 1;
    setNavigatingDirection(direction);
    startTransition(() => {
      router.push(`/bible/${bibleSlug}/${bookSlug}/${targetChapter}`);
    });
  };

  const handleNextBook = () => {
    if (!nextBook) return;
    setNavigatingDirection("next");
    startTransition(() => {
      router.push(`/bible/${bibleSlug}/${nextBook.slug}/1`);
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with chapter info */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-2 text-sm">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {bookName} {chapterNumber}
          </span>
        </div>
      </header>

      {/* Content area - scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          <ReaderEngine
            verses={verses}
            mode={currentMode}
            onModeChange={setCurrentMode}
            bookName={bookName}
            chapterNumber={chapterNumber}
            mentions={mentions}
            isPremium={isPremium}
            bibleLanguage={bibleLanguage}
            bibleId={bibleId}
            bookAbbreviation={bookAbbreviation}
            audioEnabled={audioEnabled}
          />
        </div>
      </div>

      {/* Navigation footer */}
      <footer className="sticky bottom-0 bg-background/95 backdrop-blur border-t px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Previous chapter */}
          <Button
            variant="outline"
            disabled={!hasPrevChapter || isPending}
            onClick={() => hasPrevChapter && handleNavigation("prev")}
          >
            {navigatingDirection === "prev" && isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ChevronLeft className="mr-2 h-4 w-4" />
            )}
            <span className="hidden sm:inline">{t("bible.prevChapter")}</span>
            <span className="sm:hidden">{t("common.previous")}</span>
          </Button>

          {/* Center - Chapter indicator */}
          <div className="text-center">
            <p className="text-sm font-medium">
              {bookName} {chapterNumber}
            </p>
          </div>

          {/* Next chapter or next book */}
          {hasNextChapter ? (
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => handleNavigation("next")}
            >
              <span className="hidden sm:inline">{t("bible.nextChapter")}</span>
              <span className="sm:hidden">{t("common.next")}</span>
              {navigatingDirection === "next" && isPending ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              ) : (
                <ChevronRight className="ml-2 h-4 w-4" />
              )}
            </Button>
          ) : nextBook ? (
            <Button
              variant="outline"
              disabled={isPending}
              onClick={handleNextBook}
            >
              <span className="hidden sm:inline">{t("bible.nextBook")}</span>
              <span className="sm:hidden">{nextBook.name}</span>
              {navigatingDirection === "next" && isPending ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              ) : (
                <ChevronRight className="ml-2 h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="w-[120px]" /> // Empty placeholder for layout balance
          )}
        </div>
      </footer>
    </div>
  );
}
