"use client";

import { useTranslations } from "next-intl";
import { Book, BookMarked, BookOpen, Quote } from "lucide-react";
import { NoteTargetType } from "@/app/common/note/noteScope";
import { cn } from "@/lib/utils";

const SCOPE_ICON: Record<NoteTargetType, typeof Book> = {
  bible: Book,
  book: BookOpen,
  chapter: BookMarked,
  verse: Quote,
};

const SCOPE_LABEL_KEY: Record<NoteTargetType, string> = {
  bible: "scopeBible",
  book: "scopeBook",
  chapter: "scopeChapter",
  verse: "scopeVerse",
};

interface NoteScopeBadgeProps {
  targetType: string;
  /** The denormalized human reference, e.g. "John 3:16". */
  reference?: string | null;
  className?: string;
}

export function NoteScopeBadge({ targetType, reference, className }: NoteScopeBadgeProps) {
  const t = useTranslations("notes");
  const scope = (targetType in SCOPE_ICON ? targetType : "chapter") as NoteTargetType;
  const Icon = SCOPE_ICON[scope];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary",
        className
      )}
      title={t(SCOPE_LABEL_KEY[scope])}
    >
      <Icon className="h-3 w-3 flex-shrink-0" />
      <span className="truncate">{reference || t(SCOPE_LABEL_KEY[scope])}</span>
    </span>
  );
}
