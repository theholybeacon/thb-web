"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NotebookPen, Search, StickyNote } from "lucide-react";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { Note } from "@/app/common/note/model/Note";
import { NOTE_TARGET_TYPES, NoteTargetType } from "@/app/common/note/noteScope";
import { noteGetAllByOwnerSS } from "@/app/common/note/service/server/noteGetAllByOwnerSS";
import { noteUpdateSS } from "@/app/common/note/service/server/noteUpdateSS";
import { noteDeleteSS } from "@/app/common/note/service/server/noteDeleteSS";
import { AppShell } from "@/components/app";
import { PremiumGate } from "@/components/premium";
import { NoteCard, NoteEditor } from "@/components/notes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/lib/toast";
import { logger } from "@/app/utils/logger";
import { cn } from "@/lib/utils";

type ScopeFilter = "all" | NoteTargetType;

const SCOPE_FILTERS: ScopeFilter[] = ["all", ...NOTE_TARGET_TYPES];

const SCOPE_FILTER_LABEL_KEY: Record<ScopeFilter, string> = {
  all: "filterAll",
  bible: "filterBible",
  book: "filterBook",
  chapter: "filterChapter",
  verse: "filterVerse",
};

export default function NotesPage() {
  const t = useTranslations("notes");
  const tCommon = useTranslations("common");
  const { user: loggedUser, loading } = useLoggedUserContext();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("all");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

  const { data: notes, isLoading, isError } = useQuery({
    queryKey: ["notes", "all", loggedUser?.id],
    queryFn: async () => await noteGetAllByOwnerSS(),
    enabled: Boolean(loggedUser?.id),
  });

  const invalidateNotes = () => {
    queryClient.invalidateQueries({ queryKey: ["notes"] });
  };

  const updateMutation = useMutation({
    mutationFn: async (values: { title: string; content: string }) => {
      if (!editingNote) throw new Error("No note being edited");
      return await noteUpdateSS({ id: editingNote.id, title: values.title, content: values.content });
    },
    onSuccess: () => {
      invalidateNotes();
      setEditingNote(null);
      toast.success(t("noteSaved"));
    },
    onError: (e) => {
      logger.error(e);
      toast.error(tCommon("error"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await noteDeleteSS(id),
    onSuccess: () => {
      invalidateNotes();
      setNoteToDelete(null);
      toast.success(t("noteDeleted"));
    },
    onError: (e) => {
      logger.error(e);
      toast.error(tCommon("error"));
    },
  });

  const counts = useMemo(() => {
    const result: Record<ScopeFilter, number> = { all: 0, bible: 0, book: 0, chapter: 0, verse: 0 };
    for (const note of notes ?? []) {
      result.all += 1;
      const scope = note.targetType as NoteTargetType;
      if (scope in result) result[scope] += 1;
    }
    return result;
  }, [notes]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (notes ?? []).filter((note) => {
      if (scopeFilter !== "all" && note.targetType !== scopeFilter) return false;
      if (!term) return true;
      return (
        note.content.toLowerCase().includes(term) ||
        (note.title?.toLowerCase().includes(term) ?? false) ||
        (note.reference?.toLowerCase().includes(term) ?? false)
      );
    });
  }, [notes, scopeFilter, search]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center py-20">
          <div className="animate-pulse">{tCommon("loading")}</div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PremiumGate>
      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-bold">
                <NotebookPen className="h-7 w-7 text-primary" />
                {t("title")}
              </h1>
              <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
            </div>
          </div>

          {/* Search + scope filters */}
          <div className="mb-6 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {SCOPE_FILTERS.map((filter) => (
                <Button
                  key={filter}
                  variant={scopeFilter === filter ? "secondary" : "ghost"}
                  size="sm"
                  className={cn("h-8", scopeFilter === filter && "bg-primary/10 text-primary")}
                  onClick={() => setScopeFilter(filter)}
                >
                  {t(SCOPE_FILTER_LABEL_KEY[filter])}
                  <span className="ml-1.5 text-xs text-muted-foreground">{counts[filter]}</span>
                </Button>
              ))}
            </div>
          </div>

          {isLoading && (
            <div className="py-12 text-center">
              <div className="animate-pulse">{tCommon("loading")}</div>
            </div>
          )}

          {isError && <div className="py-12 text-center text-destructive">{tCommon("error")}</div>}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="py-16 text-center">
              <StickyNote className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
              <p className="text-muted-foreground">
                {counts.all === 0 ? t("noNotes") : t("noNotesForFilter")}
              </p>
              {counts.all === 0 && (
                <p className="mt-2 text-sm text-muted-foreground">{t("noNotesHint")}</p>
              )}
            </div>
          )}

          <div className="space-y-3">
            {filtered.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={setEditingNote}
                onDelete={setNoteToDelete}
                showOpenInBible
              />
            ))}
          </div>
        </div>
      </div>
      </PremiumGate>

      {/* Edit */}
      <Dialog open={Boolean(editingNote)} onOpenChange={(o) => !o && setEditingNote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editNote")}</DialogTitle>
            <DialogDescription>{editingNote?.reference}</DialogDescription>
          </DialogHeader>
          {editingNote && (
            <NoteEditor
              initialTitle={editingNote.title}
              initialContent={editingNote.content}
              saving={updateMutation.isPending}
              onSubmit={(values) => updateMutation.mutate(values)}
              onCancel={() => setEditingNote(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={Boolean(noteToDelete)} onOpenChange={(o) => !o && setNoteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteNote")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteConfirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() => noteToDelete && deleteMutation.mutate(noteToDelete.id)}
            >
              {deleteMutation.isPending ? tCommon("loading") : tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
