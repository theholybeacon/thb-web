"use client";

import Link from "next/link";
import { Compass, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { LanguageSwitcher } from "@/components/app/LanguageSwitcher";
import { UserAvatar } from "@/components/app/UserAvatar";

export function BibleHeader() {
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
            <span>Explore</span>
          </Link>

          {/* Character index */}
          <Link
            href="/bible/people"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <Users className="h-4 w-4" />
            <span>People</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <SignedOut>
            <Link href="/auth/login">
              <Button variant="outline" size="sm">Log In</Button>
            </Link>
            <Link href="/auth/sign-up" className="hidden sm:inline-flex">
              <Button size="sm">Sign Up</Button>
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/home">
              <Button variant="outline" size="sm">Go to App</Button>
            </Link>
            <UserAvatar size="sm" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
