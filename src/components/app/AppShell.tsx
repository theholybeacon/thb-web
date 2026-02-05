"use client";

import { useState } from "react";
import Link from "next/link";
import { Sun, Menu, X, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "./UserAvatar";
import { Sidebar } from "./Sidebar";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { cn } from "@/lib/utils";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { useTranslations } from "next-intl";

interface AppShellProps {
  children: React.ReactNode;
  hideSidebar?: boolean;
}

export function AppShell({ children, hideSidebar = false }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isPremium } = useLoggedUserContext();
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            {!hideSidebar && (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
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
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            {/* Logo */}
            <Link href="/home" className="flex items-center gap-2">
              <Sun className="h-8 w-8 text-primary" />
              <span className="text-xl font-heading font-bold hidden sm:inline">The Holy Beacon</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
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

      <div className="flex">
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
              "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 transform transition-transform duration-300 lg:hidden",
              mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <Sidebar />
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
