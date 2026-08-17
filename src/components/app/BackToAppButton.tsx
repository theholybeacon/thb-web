"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLastAppRoute, sectionKeyForPath } from "@/lib/lastAppRoute";

/**
 * "← Back to Romans" pill, shown in the app header while the user is browsing
 * the public /bible tree. Returns them to the exact page they left rather than
 * to /home.
 */
export function BackToAppButton() {
  const pathname = usePathname();
  const t = useTranslations();
  const [target, setTarget] = useState<{ href: string; label: string } | null>(null);

  const onBible = pathname?.startsWith("/bible") ?? false;

  useEffect(() => {
    if (!onBible) {
      setTarget(null);
      return;
    }
    // Read after mount: sessionStorage does not exist during SSR, so touching
    // it in render would desync the first client paint from the server HTML.
    const last = getLastAppRoute();
    if (!last) {
      setTarget({ href: "/home", label: t("nav.backToApp") });
      return;
    }
    const sectionKey = sectionKeyForPath(last.path);
    const label = last.label ?? (sectionKey ? t(sectionKey) : null);
    setTarget({
      href: last.path,
      label: label ? t("nav.backTo", { label }) : t("nav.backToApp"),
    });
  }, [onBible, pathname, t]);

  if (!target) return null;

  return (
    <Link href={target.href} className="hidden sm:inline-flex">
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        <span className="max-w-[16rem] truncate">{target.label}</span>
      </Button>
    </Link>
  );
}
