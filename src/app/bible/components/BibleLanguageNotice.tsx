"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bibleForLocalePath } from "@/app/actions/locale";
import { useBibleFollowsLanguage } from "@/components/app/useBibleFollowsLanguage";
import { track } from "@/lib/analytics";

interface BibleLanguageNoticeProps {
  bibleSlug: string;
  locale: string;
  /** Both already in the app's language, e.g. "español" / "inglés". */
  bibleLanguage: string;
  appLanguage: string;
  /** The app language's default translation, e.g. "Berean Standard Bible". */
  defaultTranslation: string;
}

/**
 * Shown above the reader when the Bible is not in the app's language and the
 * reader has not said that is what they want.
 *
 * Reading a Spanish Bible with the app in English is legitimate — so we never
 * redirect a shared link — but readers kept landing there by accident. This
 * names the mismatch and offers both ways out: the app language's own Bible at
 * the same chapter, or keeping this one, which decouples the two for good.
 */
export function BibleLanguageNotice({ bibleSlug, locale, bibleLanguage, appLanguage, defaultTranslation }: BibleLanguageNoticeProps) {
  const t = useTranslations("bibleLanguageNotice");
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [, setFollowsLanguage] = useBibleFollowsLanguage();

  const readDefault = () =>
    startTransition(async () => {
      track("bible_language_notice_action", { action: "read_default", bible: bibleSlug, locale });
      const target = await bibleForLocalePath(pathname, locale);
      if (target) router.push(target);
    });

  const keep = () =>
    startTransition(async () => {
      track("bible_language_notice_action", { action: "keep", bible: bibleSlug, locale });
      await setFollowsLanguage(false);
      router.refresh();
    });

  return (
    <div
      role="status"
      data-testid="bible-language-notice"
      className="flex flex-col gap-3 border-b border-primary/30 bg-primary/5 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="flex items-start gap-2">
        <Languages className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <span>{t("message", { bibleLanguage, appLanguage })}</span>
      </p>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Button size="sm" onClick={readDefault} disabled={isPending}>
          {t("readDefault", { translation: defaultTranslation })}
        </Button>
        <Button size="sm" variant="outline" onClick={keep} disabled={isPending}>
          {t("keep")}
        </Button>
      </div>
    </div>
  );
}
