"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Compass, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { LanguageSwitcher } from "@/components/app/LanguageSwitcher";
import { UserAvatar } from "@/components/app/UserAvatar";

export function BibleHeader() {
  const t = useTranslations("landing.auth");
  const tNav = useTranslations("nav");
  const tPeople = useTranslations("people");
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold hidden sm:inline">The Holy Beacon</span>
          </Link>

          {/* Explore link */}
          <Link
            href="/bible"
            className="flex items-center gap-1.5 text-sm font-medium text-primary"
          >
            <Compass className="h-4 w-4" />
            <span>{tNav("explore")}</span>
          </Link>

          {/* Character index */}
          <Link
            href="/bible/people"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <Users className="h-4 w-4" />
            <span>{tPeople("navLabel")}</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <SignedOut>
            <Link href="/auth/login">
              <Button variant="outline" size="sm">{t("logIn")}</Button>
            </Link>
            <Link href="/auth/sign-up" className="hidden sm:inline-flex">
              <Button size="sm">{t("signUp")}</Button>
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/home">
              <Button variant="outline" size="sm">{t("goToApp")}</Button>
            </Link>
            <UserAvatar size="sm" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
