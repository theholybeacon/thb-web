"use client";

import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/app/UserAvatar";
import { LanguageSwitcher } from "@/components/app/LanguageSwitcher";
import { Sun } from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { useTranslations } from "next-intl";

export function Header() {
    const t = useTranslations("landing");

    return (
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between py-4">
                <div className="flex items-center gap-2">
                    <Sun className="h-8 w-8 text-primary" />
                    <span className="text-xl font-bold">The Holy Beacon</span>
                </div>
                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/bible" className="text-sm font-medium hover:text-primary">
                        {t("nav.explore")}
                    </Link>
                    <Link href="#features" className="text-sm font-medium hover:text-primary">
                        {t("nav.features")}
                    </Link>
                    <Link href="#study-plans" className="text-sm font-medium hover:text-primary">
                        {t("nav.studyPlans")}
                    </Link>
                    <Link href="#roadmap" className="text-sm font-medium hover:text-primary">
                        {t("nav.roadmap")}
                    </Link>
                    <Link href="#pricing" className="text-sm font-medium hover:text-primary">
                        {t("nav.pricing")}
                    </Link>
                </nav>
                <div className="flex items-center gap-2">
                    <LanguageSwitcher />
                    <SignedOut>
                        <Link href="/auth/login">
                            <Button variant="outline">{t("auth.logIn")}</Button>
                        </Link>
                        <Link href="/auth/sign-up">
                            <Button>{t("auth.signUp")}</Button>
                        </Link>
                    </SignedOut>
                    <SignedIn>
                        <Link href="/home">
                            <Button variant="outline">{t("auth.goToApp")}</Button>
                        </Link>
                        <UserAvatar size="sm" />
                    </SignedIn>
                </div>
            </div>
        </header>
    );
}
