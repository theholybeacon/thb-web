"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NOTE_CONTENT_MAX_LENGTH } from "@/app/common/note/noteScope";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface NoteEditorProps {
  initialTitle?: string | null;
  initialContent?: string;
  /** Rendered above the fields — used for the scope picker when composing. */
  header?: React.ReactNode;
  saving?: boolean;
  autoFocus?: boolean;
  submitLabel?: string;
  onSubmit: (values: { title: string; content: string }) => void;
  onCancel: () => void;
  className?: string;
}

export function NoteEditor({
  initialTitle,
  initialContent,
  header,
  saving = false,
  autoFocus = true,
  submitLabel,
  onSubmit,
  onCancel,
  className,
}: NoteEditorProps) {
  const t = useTranslations("notes");
  const tCommon = useTranslations("common");
  const [title, setTitle] = useState(initialTitle ?? "");
  const [content, setContent] = useState(initialContent ?? "");
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) contentRef.current?.focus();
  }, [autoFocus]);

  const trimmed = content.trim();
  const canSubmit = trimmed.length > 0 && trimmed.length <= NOTE_CONTENT_MAX_LENGTH && !saving;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ title: title.trim(), content: trimmed });
  };

  // Cmd/Ctrl+Enter saves, Escape cancels — the panel is a writing surface.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (canSubmit) onSubmit({ title: title.trim(), content: trimmed });
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-3", className)}>
      {header}

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t("titlePlaceholder")}
        maxLength={255}
        className="h-9"
      />

      <div className="space-y-1">
        <Textarea
          ref={contentRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("contentPlaceholder")}
          rows={6}
          className="resize-y"
        />
        <div className="flex justify-end">
          <span
            className={cn(
              "text-xs text-muted-foreground",
              trimmed.length > NOTE_CONTENT_MAX_LENGTH && "text-destructive"
            )}
          >
            {trimmed.length} / {NOTE_CONTENT_MAX_LENGTH}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          {tCommon("cancel")}
        </Button>
        <Button type="submit" size="sm" disabled={!canSubmit}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel ?? tCommon("save")}
        </Button>
      </div>
    </form>
  );
}
