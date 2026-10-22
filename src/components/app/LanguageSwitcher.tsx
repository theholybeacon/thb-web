"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { setLocale } from "@/app/actions/locale";
import { type Locale } from "@/i18n/request";
import { track } from "@/lib/analytics";

export function LanguageSwitcher() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const currentLocale = useLocale();

  const handleLocaleChange = (locale: Locale) => {
    startTransition(async () => {
      await setLocale(locale);
      track("language_changed", { locale, from: currentLocale });
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isPending}>
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleLocaleChange("en")}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLocaleChange("es")}>
          Español
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
