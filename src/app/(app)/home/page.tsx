"use client";

import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { useTranslations } from "next-intl";
import { AppShell } from "@/components/app";
import Link from "next/link";
import { BookOpen, Clock, Sun } from "lucide-react";

export default function HomePage() {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const { user, loading } = useLoggedUserContext();

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
      <div className="p-6 lg:p-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">
              {user?.name ? t("welcome", { name: user.name }) : t("welcomeDefault")}
            </h1>
            <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/study" className="group">
              <div className="rounded-lg border bg-card p-6 hover:border-primary hover:shadow-md transition-all h-full">
                <BookOpen className="h-8 w-8 text-primary mb-4" />
                <h2 className="text-xl font-semibold mb-2">{t("myStudies")}</h2>
                <p className="text-muted-foreground">{t("myStudiesDesc")}</p>
              </div>
            </Link>

            <Link href="/session" className="group">
              <div className="rounded-lg border bg-card p-6 hover:border-primary hover:shadow-md transition-all h-full">
                <Clock className="h-8 w-8 text-primary mb-4" />
                <h2 className="text-xl font-semibold mb-2">{t("activeSessions")}</h2>
                <p className="text-muted-foreground">{t("activeSessionsDesc")}</p>
              </div>
            </Link>

            <Link href="/study/create" className="group">
              <div className="rounded-lg border bg-card p-6 hover:border-primary hover:shadow-md transition-all h-full">
                <Sun className="h-8 w-8 text-primary mb-4" />
                <h2 className="text-xl font-semibold mb-2">{t("newStudy")}</h2>
                <p className="text-muted-foreground">{t("newStudyDesc")}</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
