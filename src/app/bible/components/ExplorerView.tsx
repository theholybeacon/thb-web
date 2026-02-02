"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Verse } from "@/app/common/verse/model/Verse";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Keyboard,
  Headphones,
  BookOpen,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ReadMode } from "@/app/(app)/session/[id]/components/modes/ReadMode";
import { TypeMode } from "@/app/(app)/session/[id]/components/modes/TypeMode";
import { ListenMode } from "@/app/(app)/session/[id]/components/modes/ListenMode";

type ExploreMode = "read" | "type" | "listen";

interface ExplorerViewProps {
  verses: Verse[];
  bookName: string;
  chapterNumber: number;
  bibleSlug: string;
  bookSlug: string;
  hasPrevChapter: boolean;
  hasNextChapter: boolean;
  nextBook?: { name: string; slug: string } | null;
}

const EXPLORE_MODES: { id: ExploreMode; icon: typeof Eye; labelKey: string }[] = [
  { id: "read", icon: Eye, labelKey: "session.modeRead" },
  { id: "type", icon: Keyboard, labelKey: "session.modeType" },
  { id: "listen", icon: Headphones, labelKey: "session.modeListen" },
];

export function ExplorerView({
  verses,
  bookName,
  chapterNumber,
  bibleSlug,
  bookSlug,
  hasPrevChapter,
  hasNextChapter,
  nextBook,
}: ExplorerViewProps) {
  const t = useTranslations();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentMode, setCurrentMode] = useState<ExploreMode>("read");
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
      {/* Header with mode selector */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Chapter info */}
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {bookName} {chapterNumber}
              </span>
            </div>

            {/* Mode selector */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              {EXPLORE_MODES.map((mode) => (
                <Button
                  key={mode.id}
                  variant={currentMode === mode.id ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-8 px-3",
                    currentMode === mode.id && "bg-background shadow-sm"
                  )}
                  onClick={() => setCurrentMode(mode.id)}
                >
                  <mode.icon className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">{t(mode.labelKey)}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Content area - scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          {verses.length > 0 ? (
            <>
              {currentMode === "read" && (
                <ReadMode
                  verses={verses}
                  bookName={bookName}
                  chapterNumber={chapterNumber}
                  showCompletion={false}
                />
              )}

              {currentMode === "type" && (
                <TypeMode
                  verses={verses}
                  showCompletion={false}
                />
              )}

              {currentMode === "listen" && (
                <ListenMode
                  verses={verses}
                  bookName={bookName}
                  chapterNumber={chapterNumber}
                  showCompletion={false}
                />
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">{t("bible.noContent")}</p>
            </div>
          )}
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
