"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "./UserAvatar";
import { Sidebar } from "./Sidebar";
import { TrialBanner } from "./TrialBanner";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { AppRouteRecorder } from "./AppRouteRecorder";
import { BackToAppButton } from "./BackToAppButton";
import { useImmersiveViewport } from "./useImmersiveViewport";
import { cn } from "@/lib/utils";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { useTranslations } from "next-intl";

interface AppShellProps {
  children: React.ReactNode;
  hideSidebar?: boolean;
  /**
   * For screens that are one tool filling the screen (the reading engine, the
   * study builder): the shell is pinned to what is visible — above the
   * on-screen keyboard — the page never scrolls, only the screen's own panes
   * do, and on phones the header shrinks to a slim bar. Its children get a
   * height-bound flex column to fill (`flex-1 min-h-0`).
   */
  immersive?: boolean;
}

export function AppShell({ children, hideSidebar = false, immersive = false }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isPremium } = useLoggedUserContext();
  const t = useTranslations();
  const viewport = useImmersiveViewport(immersive);

  return (
    // --thb-header-h lets height-bound children (the /bible reader) size
    // themselves without hardcoding which chrome is wrapping them.
    <div
      className={cn(
        "bg-background [--thb-header-h:4rem]",
        immersive
          ? "fixed inset-x-0 top-0 flex h-[100dvh] flex-col overflow-hidden max-md:[--thb-header-h:2.75rem]"
          : "min-h-screen",
      )}
      style={viewport ? { height: viewport.height, top: viewport.top } : undefined}
    >
      <AppRouteRecorder />

      {/* Header */}
      <header
        className={cn(
          "sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80",
          immersive && "thb-keyboard-hide shrink-0",
        )}
      >
        <div className="flex h-[var(--thb-header-h)] items-center justify-between px-4 max-md:px-2">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            {!hideSidebar && (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileSidebarOpen(prev => !prev)}
              >
                {mobileSidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            )}

            {/* Desktop sidebar toggle */}
            {!hideSidebar && (
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex"
                onClick={() => setSidebarOpen(prev => !prev)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            {/* Logo */}
            <Link href="/home" className="flex items-center gap-2">
              <span className="text-xl font-heading font-bold hidden sm:inline">The Holy Beacon</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* A slim bar on phones: the screen below is the point. */}
            <div className={cn("contents", immersive && "max-md:hidden")}>
              <BackToAppButton />
              <LanguageSwitcher />
            </div>
            {isPremium ? (
              <Link href="/subscription">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-primary"
                  title={t("subscription.title")}
                >
                  <Crown className="h-5 w-5 fill-current" />
                </Button>
              </Link>
            ) : (
              <Link href="/subscription">
                <Button variant="default" size="sm">
                  <Crown className="h-4 w-4 mr-2" />
                  {t("premium.upgrade")}
                </Button>
              </Link>
            )}
            <UserAvatar />
          </div>
        </div>
      </header>

      <div className={cn(immersive && "max-md:hidden")}>
        <TrialBanner />
      </div>

      <div className={cn("flex", immersive && "min-h-0 flex-1")}>
        {/* Desktop Sidebar */}
        {!hideSidebar && (
          <div
            className={cn(
              "hidden lg:block transition-all duration-300",
              sidebarOpen ? "w-64" : "w-16"
            )}
          >
            <Sidebar collapsed={!sidebarOpen} />
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        {!hideSidebar && mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        {!hideSidebar && (
          <div
            className={cn(
              "fixed bottom-0 left-0 top-[var(--thb-header-h)] z-40 w-64 transform transition-transform duration-300 lg:hidden",
              mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <Sidebar />
          </div>
        )}

        {/* Main Content */}
        {/* min-w-0: a flex item defaults to min-width:auto, so without this the
            /bible reader's own flex row (fixed-width book sidebar + reader)
            props this open past the viewport on narrow screens. */}
        <main
          className={cn(
            "flex-1 min-w-0",
            immersive ? "relative flex min-h-0 flex-col overflow-hidden" : "min-h-[calc(100vh-4rem)]",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
