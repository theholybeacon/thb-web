"use client";

import { useQuery } from "@tanstack/react-query";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { sessionGetAllByOwnerId } from "@/app/common/session/service/sessionGetAllByOwnerIdSS";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  GraduationCap,
  Play,
  ChevronRight,
  Home,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SessionFull } from "@/app/common/session/model/Session";

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const t = useTranslations();
  const { user: loggedUser } = useLoggedUserContext();
  const router = useRouter();
  const pathname = usePathname();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["sessions", loggedUser?.id],
    queryFn: async () => {
      if (!loggedUser?.id) return [];
      return await sessionGetAllByOwnerId(loggedUser.id);
    },
    enabled: Boolean(loggedUser?.id),
  });

  const navItems = [
    { href: "/home", label: t("nav.home"), icon: Home },
    { href: "/study", label: t("nav.studies"), icon: GraduationCap },
    { href: "/session", label: t("nav.sessions"), icon: Play },
  ];

  const getProgress = (session: SessionFull) => {
    if (!session.study?.steps?.length) return 0;
    const currentStepIndex = session.study.steps.findIndex(
      (step) => step.id === session.currentStepId
    );
    if (currentStepIndex === -1) return 0;
    return Math.round(((currentStepIndex + 1) / session.study.steps.length) * 100);
  };

  if (collapsed) {
    return (
      <aside className="w-16 border-r bg-card h-[calc(100vh-4rem)] sticky top-16 flex flex-col py-4">
        <nav className="flex flex-col items-center gap-2 px-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                size="icon"
                className="h-10 w-10"
                title={item.label}
              >
                <item.icon className="h-5 w-5" />
              </Button>
            </Link>
          ))}
        </nav>
      </aside>
    );
  }

  return (
    <aside className="w-64 border-r bg-card h-[calc(100vh-4rem)] sticky top-16 flex flex-col">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className="w-full justify-start gap-3"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>

      <Separator />

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {t("sidebar.activeSessions")}
          </h3>
          <Link href="/study/create">
            <Button variant="ghost" size="icon" className="h-6 w-6" title={t("nav.newStudy")}>
              <Plus className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && sessions?.length === 0 && (
          <div className="text-center py-6">
            <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">{t("sidebar.noSessions")}</p>
            <Link href="/study">
              <Button variant="link" size="sm" className="mt-1">
                {t("sidebar.startStudy")}
              </Button>
            </Link>
          </div>
        )}

        <div className="space-y-2">
          {sessions?.map((session) => {
            const progress = getProgress(session);
            const isActive = pathname === `/session/${session.id}`;

            return (
              <button
                key={session.id}
                onClick={() => router.push(`/session/${session.id}`)}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-colors group",
                  isActive
                    ? "bg-primary/10 border border-primary/30"
                    : "hover:bg-muted/50 border border-transparent"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {session.study?.name || "Untitled Study"}
                    </p>
                    {session.study?.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {session.study.description}
                      </p>
                    )}
                  </div>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform flex-shrink-0 mt-1",
                      "group-hover:translate-x-0.5"
                    )}
                  />
                </div>

                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{t("session.progress")}</span>
                    <span className="text-primary font-medium">{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
