"use client";

import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/app/UserAvatar";
import { Sun } from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export function Header() {
    return (
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between py-4">
                <div className="flex items-center gap-2">
                    <Sun className="h-8 w-8 text-primary" />
                    <span className="text-xl font-bold">The Holy Beacon</span>
                </div>
                <nav className="hidden md:flex items-center gap-6">
                    <Link href="#features" className="text-sm font-medium hover:text-primary">
                        Features
                    </Link>
                    <Link href="#study-plans" className="text-sm font-medium hover:text-primary">
                        Study Plans
                    </Link>
                    <Link href="#roadmap" className="text-sm font-medium hover:text-primary">
                        Roadmap
                    </Link>
                    <Link href="#pricing" className="text-sm font-medium hover:text-primary">
                        Pricing
                    </Link>
                </nav>
                <div className="flex items-center gap-4">
                    <SignedOut>
                        <Link href="/auth/login">
                            <Button variant="outline">Log In</Button>
                        </Link>
                        <Link href="/auth/sign-up">
                            <Button>Sign Up</Button>
                        </Link>
                    </SignedOut>
                    <SignedIn>
                        <Link href="/home">
                            <Button variant="outline">Dashboard</Button>
                        </Link>
                        <UserAvatar size="sm" />
                    </SignedIn>
                </div>
            </div>
        </header>
    );
}
