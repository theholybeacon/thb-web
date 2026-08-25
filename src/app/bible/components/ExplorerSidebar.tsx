"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Book } from "@/app/common/book/model/Book";
import { Bible } from "@/app/common/bible/model/Bible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  Search,
  BookOpen,
  X,
  ArrowLeft,
  Loader2,
  PanelLeft,
  PanelLeftClose,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ListenableIndicator } from "@/components/audio/ListenableIndicator";
import { useExplorerSidebar } from "./useExplorerSidebar";

interface ExplorerSidebarProps {
  bible: Bible;
  books: Book[];
}

// Old Testament has first 39 books
const OT_BOOKS_COUNT = 39;

export function ExplorerSidebar({ bible, books }: ExplorerSidebarProps) {
  const t = useTranslations("bible");
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingChapter, setLoadingChapter] = useState<{ book: string; chapter: number } | null>(null);

  // Parse current book and chapter from pathname
  const pathParts = pathname.split("/");
  const currentBookAbbr = pathParts[3]?.toLowerCase();
  const currentChapter = pathParts[4] ? parseInt(pathParts[4], 10) : undefined;

  const [expandedBooks, setExpandedBooks] = useState<Set<string>>(new Set());
  const { open, openSidebar, closeSidebar } = useExplorerSidebar();

  // Clear loading state when pathname changes (navigation completed)
  useEffect(() => {
    setLoadingChapter(null);
  }, [pathname]);

  // Auto-expand current book when navigating
  useEffect(() => {
    if (currentBookAbbr) {
      setExpandedBooks((prev) => new Set([...prev, currentBookAbbr]));
    }
  }, [currentBookAbbr]);

  const bibleSlug = bible.slug;

  // Sort books and split into OT/NT
  const sortedBooks = [...books].sort((a, b) => a.bookOrder - b.bookOrder);
  const oldTestament = sortedBooks.filter((b) => b.bookOrder <= OT_BOOKS_COUNT);
  const newTestament = sortedBooks.filter((b) => b.bookOrder > OT_BOOKS_COUNT);

  // Filter books by search
  const filterBooks = (bookList: Book[]) => {
    if (!searchQuery.trim()) return bookList;
    const query = searchQuery.toLowerCase();
    return bookList.filter(
      (b) =>
        b.name.toLowerCase().includes(query) ||
        b.abbreviation.toLowerCase().includes(query)
    );
  };

  const filteredOT = filterBooks(oldTestament);
  const filteredNT = filterBooks(newTestament);

  /**
   * Below `lg` the book list covers the reader, so picking a chapter has to
   * dismiss it — otherwise the reader lands on a chapter they cannot see.
   * Read in a handler, never during render, so SSR stays honest.
   */
  const dismissOnNarrow = () => {
    if (!window.matchMedia("(min-width: 1024px)").matches) closeSidebar();
  };

  const toggleBook = (abbr: string) => {
    const newExpanded = new Set(expandedBooks);
    if (newExpanded.has(abbr)) {
      newExpanded.delete(abbr);
    } else {
      newExpanded.add(abbr);
    }
    setExpandedBooks(newExpanded);
  };

  const BookItem = ({ book }: { book: Book }) => {
    const bookSlug = book.slug;
    const isExpanded = expandedBooks.has(bookSlug);
    const isCurrentBook = currentBookAbbr === bookSlug;
    const chapters = Array.from({ length: book.numChapters || 1 }, (_, i) => i + 1);

    return (
      <Collapsible open={isExpanded} onOpenChange={() => toggleBook(bookSlug)}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors",
              isCurrentBook
                ? "bg-primary/10 text-primary font-medium"
                : "hover:bg-muted"
            )}
          >
            <span className="truncate">{book.name}</span>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-xs text-muted-foreground">
                {book.numChapters}
              </span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid grid-cols-5 gap-1 px-3 py-2">
            {chapters.map((chapter) => {
              const isCurrentChapter =
                isCurrentBook && currentChapter === chapter;
              const isLoading =
                loadingChapter?.book === bookSlug &&
                loadingChapter?.chapter === chapter;
              return (
                <Link
                  key={chapter}
                  href={`/bible/${bibleSlug}/${bookSlug}/${chapter}`}
                  onClick={(e) => {
                    dismissOnNarrow();
                    if (isCurrentChapter) return;
                    e.preventDefault();
                    setLoadingChapter({ book: bookSlug, chapter });
                    startTransition(() => {
                      router.push(`/bible/${bibleSlug}/${bookSlug}/${chapter}`);
                    });
                  }}
                  className={cn(
                    "aspect-square flex items-center justify-center text-xs rounded transition-colors",
                    isCurrentChapter
                      ? "bg-primary text-primary-foreground font-medium"
                      : isLoading
                      ? "bg-primary/50 text-primary-foreground"
                      : "bg-muted/50 hover:bg-primary hover:text-primary-foreground"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    chapter
                  )}
                </Link>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  /**
   * Rendered twice: in flow inside the aside on `lg`, and as a full-screen
   * overlay below it. Hoisted rather than duplicated, the same way SessionView
   * shares its steps sidebar between breakpoints.
   */
  const panelBody = (
    <>
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center gap-2">
          <Link href="/bible">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold truncate text-sm">{bible.name}</h2>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {bible.version}
              <ListenableIndicator audioEnabled={bible.audioEnabled} />
            </p>
          </div>
          {/* Collapse. On desktop this shrinks the aside to its rail; below `lg`
              it dismisses the overlay, so the icon says so. */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={closeSidebar}
            title={t("hideBooks")}
            aria-label={t("hideBooks")}
          >
            <PanelLeftClose className="h-4 w-4 hidden lg:block" />
            <X className="h-4 w-4 lg:hidden" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchBooks")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Books list */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Old Testament */}
          {filteredOT.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                {t("oldTestament")}
              </h3>
              <div className="space-y-0.5">
                {filteredOT.map((book) => (
                  <BookItem key={book.id} book={book} />
                ))}
              </div>
            </div>
          )}

          {/* New Testament */}
          {filteredNT.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                {t("newTestament")}
              </h3>
              <div className="space-y-0.5">
                {filteredNT.map((book) => (
                  <BookItem key={book.id} book={book} />
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {filteredOT.length === 0 && filteredNT.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">{t("noResults")}</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </>
  );

  return (
    <>
      {/*
       * The aside stays in flow at every breakpoint so the reader is never
       * covered by a sidebar it cannot see the edge of. Collapsed it is a 48px
       * rail; expanded it is the full panel on `lg`, and the overlay below.
       */}
      <aside
        className={cn(
          "flex h-full flex-shrink-0 flex-col border-r bg-card transition-[width] duration-300",
          open === false ? "w-12" : "w-12 lg:w-72"
        )}
      >
        {/* Rail. Below `lg` it is the only thing the aside ever shows — the
            expanded panel lives in the overlay, so the reading column keeps its
            width whether the list is open or not. */}
        <div
          className={cn(
            "flex flex-col items-center gap-1 py-3",
            open !== false && "lg:hidden"
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={openSidebar}
            title={t("showBooks")}
            aria-label={t("showBooks")}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Desktop: the panel in flow, reflowing the reader instead of covering it. */}
        {open !== false && (
          <div className="hidden min-h-0 flex-1 flex-col lg:flex">{panelBody}</div>
        )}
      </aside>

      {/*
       * Mobile: no room to reflow, so the panel takes the screen below the
       * chrome. --thb-header-h inherits down here, so this sits flush under
       * both the public header (3.5rem) and the app shell's (4rem).
       */}
      {open === true && (
        <div className="fixed inset-x-0 bottom-0 top-[var(--thb-header-h,3.5rem)] z-40 flex flex-col bg-card lg:hidden">
          {panelBody}
        </div>
      )}
    </>
  );
}
