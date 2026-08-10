"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, NotebookPen, Plus, StickyNote, X } from "lucide-react";
import { Verse } from "@/app/common/verse/model/Verse";
import { Note } from "@/app/common/note/model/Note";
import { NoteTargetType } from "@/app/common/note/noteScope";
import { noteCreateSS } from "@/app/common/note/service/server/noteCreateSS";
import { noteUpdateSS } from "@/app/common/note/service/server/noteUpdateSS";
import { noteDeleteSS } from "@/app/common/note/service/server/noteDeleteSS";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { NoteCard } from "./NoteCard";
import { NoteEditor } from "./NoteEditor";

/** Canonical coordinates of the chapter being read. */
export interface NotesPanelContext {
  bibleId: string;
  bibleName: string;
  /** Canonical USFM abbreviation (book.apiId). */
  bookAbbreviation: string;
  bookName: string;
  chapterNumber: number;
}

export interface NoteComposeRequest {
  verseNumber: number | null;
  /** Bumped by the caller so repeated clicks on the same verse reopen the composer. */
  nonce: number;
}

interface NotesPanelProps {
  open: boolean;
  onClose: () => void;
  notes: Note[];
  isLoading: boolean;
  context: NotesPanelContext;
  verses: Verse[];
  composeRequest?: NoteComposeRequest | null;
  /** Called after any write so the owner can refresh its list. */
  onChanged: () => void;
}

const SCOPE_SECTIONS: NoteTargetType[] = ["verse", "chapter", "book", "bible"];

const SECTION_LABEL_KEY: Record<NoteTargetType, string> = {
  verse: "sectionVerse",
  chapter: "sectionChapter",
  book: "sectionBook",
  bible: "sectionBible",
};

export function NotesPanel({
  open,
  onClose,
  notes,
  isLoading,
  context,
  verses,
  composeRequest,
  onChanged,
}: NotesPanelProps) {
  const t = useTranslations("notes");
  const tCommon = useTranslations("common");

  const [composing, setComposing] = useState(false);
  const [scope, setScope] = useState<NoteTargetType>("chapter");
  const [verseNumber, setVerseNumber] = useState<number | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const sortedVerses = useMemo(
    () => [...verses].sort((a, b) => a.verseNumber - b.verseNumber),
    [verses]
  );

  // A verse click in the reader opens the composer already scoped to that verse.
  useEffect(() => {
    if (!composeRequest) return;
    setEditingNote(null);
    setComposing(true);
    if (composeRequest.verseNumber) {
      setScope("verse");
      setVerseNumber(composeRequest.verseNumber);
    }
  }, [composeRequest]);

  // Verse scope always needs a concrete verse; fall back to the first one.
  useEffect(() => {
    if (scope === "verse" && verseNumber === null && sortedVerses.length > 0) {
      setVerseNumber(sortedVerses[0].verseNumber);
    }
  }, [scope, verseNumber, sortedVerses]);

  const handleCreate = async (values: { title: string; content: string }) => {
    setSaving(true);
    try {
      await noteCreateSS({
        targetType: scope,
        bibleId: context.bibleId,
        bookAbbreviation: scope === "bible" ? null : context.bookAbbreviation,
        chapter: scope === "chapter" || scope === "verse" ? context.chapterNumber : null,
        verse: scope === "verse" ? verseNumber : null,
        title: values.title,
        content: values.content,
      });
      setComposing(false);
      toast.success(t("noteSaved"));
      onChanged();
    } catch (e) {
      logger.error(e);
      toast.error(tCommon("error"));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (values: { title: string; content: string }) => {
    if (!editingNote) return;
    setSaving(true);
    try {
      await noteUpdateSS({ id: editingNote.id, title: values.title, content: values.content });
      setEditingNote(null);
      toast.success(t("noteSaved"));
      onChanged();
    } catch (e) {
      logger.error(e);
      toast.error(tCommon("error"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!noteToDelete) return;
    setDeleting(true);
    try {
      await noteDeleteSS(noteToDelete.id);
      setNoteToDelete(null);
      toast.success(t("noteDeleted"));
      onChanged();
    } catch (e) {
      logger.error(e);
      toast.error(tCommon("error"));
    } finally {
      setDeleting(false);
    }
  };

  const grouped = useMemo(() => {
    const map = new Map<NoteTargetType, Note[]>();
    for (const section of SCOPE_SECTIONS) map.set(section, []);
    for (const note of notes) {
      const bucket = map.get(note.targetType as NoteTargetType);
      if (bucket) bucket.push(note);
    }
    // Verse notes read best in passage order rather than by edit time.
    map.get("verse")?.sort((a, b) => (a.verse ?? 0) - (b.verse ?? 0));
    return map;
  }, [notes]);

  const startCompose = () => {
    setEditingNote(null);
    setScope("chapter");
    setComposing(true);
  };

  const scopeOptions: { value: NoteTargetType; label: string }[] = [
    { value: "verse", label: t("onThisVerse") },
    { value: "chapter", label: t("onThisChapter", { reference: `${context.bookName} ${context.chapterNumber}` }) },
    { value: "book", label: t("onThisBook", { reference: context.bookName }) },
    { value: "bible", label: t("onThisBible", { reference: context.bibleName }) },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l bg-background shadow-xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
        aria-hidden={!open}
      >
        <header className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <NotebookPen className="h-5 w-5 flex-shrink-0 text-primary" />
            <div className="min-w-0">
              <h2 className="truncate font-semibold">{t("panelTitle")}</h2>
              <p className="truncate text-xs text-muted-foreground">
                {context.bookName} {context.chapterNumber}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={tCommon("cancel")}>
            <X className="h-5 w-5" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {composing ? (
              <div className="rounded-lg border bg-card p-4">
                <NoteEditor
                  saving={saving}
                  onSubmit={handleCreate}
                  onCancel={() => setComposing(false)}
                  header={
                    <div className="space-y-2">
                      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {t("scope")}
                      </label>
                      <Select value={scope} onValueChange={(v) => setScope(v as NoteTargetType)}>
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {scopeOptions.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                              disabled={option.value === "verse" && sortedVerses.length === 0}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {scope === "verse" && (
                        <Select
                          value={verseNumber ? String(verseNumber) : ""}
                          onValueChange={(v) => setVerseNumber(Number(v))}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder={t("selectVerse")} />
                          </SelectTrigger>
                          <SelectContent>
                            {sortedVerses.map((verse) => (
                              <SelectItem key={verse.id} value={String(verse.verseNumber)}>
                                {context.bookName} {context.chapterNumber}:{verse.verseNumber}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  }
                />
              </div>
            ) : (
              <Button className="w-full" onClick={startCompose}>
                <Plus className="mr-2 h-4 w-4" />
                {t("newNote")}
              </Button>
            )}

            {isLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isLoading && notes.length === 0 && !composing && (
              <div className="py-10 text-center">
                <StickyNote className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">{t("noNotesHere")}</p>
              </div>
            )}

            {SCOPE_SECTIONS.map((section) => {
              const sectionNotes = grouped.get(section) ?? [];
              if (sectionNotes.length === 0) return null;

              return (
                <section key={section} className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t(SECTION_LABEL_KEY[section])}
                  </h3>
                  {sectionNotes.map((note) =>
                    editingNote?.id === note.id ? (
                      <div key={note.id} className="rounded-lg border bg-card p-4">
                        <NoteEditor
                          initialTitle={note.title}
                          initialContent={note.content}
                          saving={saving}
                          onSubmit={handleUpdate}
                          onCancel={() => setEditingNote(null)}
                        />
                      </div>
                    ) : (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onEdit={(n) => {
                          setComposing(false);
                          setEditingNote(n);
                        }}
                        onDelete={setNoteToDelete}
                      />
                    )
                  )}
                </section>
              );
            })}
          </div>
        </div>
      </aside>

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
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? tCommon("loading") : tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
