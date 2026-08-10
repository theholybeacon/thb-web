"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ExternalLink, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Note } from "@/app/common/note/model/Note";
import { buildNoteHref } from "@/app/common/note/noteScope";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { NoteScopeBadge } from "./NoteScopeBadge";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  /** Shows a link back to the passage. Off inside the reader, where you are already there. */
  showOpenInBible?: boolean;
  className?: string;
}

function formatUpdatedAt(value: Date | string | null): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function NoteCard({ note, onEdit, onDelete, showOpenInBible = false, className }: NoteCardProps) {
  const t = useTranslations("notes");
  const tCommon = useTranslations("common");
  const href = showOpenInBible ? buildNoteHref(note) : null;

  return (
    <article
      className={cn(
        "rounded-lg border bg-card p-4 transition-colors hover:border-primary/40",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <NoteScopeBadge targetType={note.targetType} reference={note.reference} />
          {note.title && (
            <h3 className="mt-2 font-semibold leading-tight break-words">{note.title}</h3>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(note)}>
              <Pencil className="mr-2 h-4 w-4" />
              {tCommon("edit")}
            </DropdownMenuItem>
            {href && (
              <DropdownMenuItem asChild>
                <Link href={href}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {t("openInBible")}
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(note)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {tCommon("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90">
        {note.content}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{t("updatedAt", { date: formatUpdatedAt(note.updatedAt) })}</span>
        {href && (
          <Link href={href} className="inline-flex items-center gap-1 hover:text-primary">
            {t("openInBible")}
            <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>
    </article>
  );
}
