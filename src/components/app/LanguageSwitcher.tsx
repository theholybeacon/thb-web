"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { changeAppLanguage } from "@/app/actions/locale";
import { type Locale } from "@/i18n/request";
import { track } from "@/lib/analytics";
import { useBibleFollowsLanguage } from "./useBibleFollowsLanguage";

/**
 * The globe: the app language, and whether the Bible follows it.
 *
 * Following is the default, so changing the language here also changes the
 * translation being read — what readers expected the globe to do. The checkbox
 * is the way out for someone who wants the app in one language and the Bible in
 * another, and says so in the menu rather than leaving them to guess.
 */
export function LanguageSwitcher() {
  const t = useTranslations("languageMenu");
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const currentLocale = useLocale();
  const [followsLanguage, setFollowsLanguage] = useBibleFollowsLanguage();

  const handleLocaleChange = (locale: string) => {
    if (locale === currentLocale) return;
    startTransition(async () => {
      const { redirectTo } = await changeAppLanguage(locale as Locale, pathname);
      track("language_changed", { locale, from: currentLocale, bible_follows: followsLanguage, bible_moved: !!redirectTo });
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    });
  };

  const handleFollowsChange = (follows: boolean) => {
    startTransition(async () => {
      await setFollowsLanguage(follows);
      track("bible_follows_language_changed", { follows });
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isPending} aria-label={t("label")}>
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>{t("appLanguage")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={currentLocale} onValueChange={handleLocaleChange}>
          <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="es">Español</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={followsLanguage}
          onCheckedChange={(checked) => handleFollowsChange(checked === true)}
          onSelect={(e) => e.preventDefault()}
        >
          <span className="flex flex-col">
            <span>{t("bibleFollows")}</span>
            <span className="text-xs text-muted-foreground">
              {followsLanguage ? t("bibleFollowsOn") : t("bibleFollowsOff")}
            </span>
          </span>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
