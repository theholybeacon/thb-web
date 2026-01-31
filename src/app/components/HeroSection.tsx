"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, Sparkles, Compass } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative w-full py-16 md:py-28 lg:py-36 xl:py-48 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

      {/* Decorative floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow animation-delay-500" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container relative px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left content */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-4">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary border border-primary/20 animate-fade-down opacity-0">
                <Sparkles className="h-4 w-4" />
                <span className="font-medium">AI-Powered Bible Study</span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none animate-fade-up opacity-0 animation-delay-100">
                Illuminate Your Path{" "}
                <span className="gradient-text">Through the Word</span>
              </h1>

              {/* Description */}
              <p className="max-w-[600px] text-muted-foreground text-lg md:text-xl animate-fade-up opacity-0 animation-delay-200">
                The Holy Beacon is a smart, spiritually-aligned productivity tool that helps believers build a
                deeper, more meaningful relationship with Scripture—one that adapts to your lifestyle, learning
                style, and spiritual maturity.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 min-[400px]:flex-row animate-fade-up opacity-0 animation-delay-300">
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-primary hover:bg-primary/90 glow-sm hover:glow transition-all duration-300 group">
                  <span>Start Your Journey</span>
                  <Compass className="ml-2 h-4 w-4 transition-transform group-hover:rotate-45" />
                </Button>
              </Link>
              <Link href="#roadmap">
                <Button size="lg" variant="outline" className="hover-lift">
                  View Roadmap
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-4 animate-fade-up opacity-0 animation-delay-400">
              <div className="space-y-1">
                <p className="text-2xl font-bold gradient-text">100%</p>
                <p className="text-sm text-muted-foreground">Personalized</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold gradient-text">AI</p>
                <p className="text-sm text-muted-foreground">Powered</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold gradient-text">66</p>
                <p className="text-sm text-muted-foreground">Books Covered</p>
              </div>
            </div>
          </div>

          {/* Right decorative element */}
          <div className="relative flex items-center justify-center animate-scale-in opacity-0 animation-delay-200">
            {/* Main beacon/book visual */}
            <div className="relative">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 to-accent/20 blur-2xl scale-150 animate-pulse-glow" />

              {/* Main circle */}
              <div className="relative w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 flex items-center justify-center">
                {/* Inner ring */}
                <div className="absolute inset-4 rounded-full border border-primary/10 animate-[spin_30s_linear_infinite]">
                  {/* Orbiting dots */}
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary/60" />
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-accent/60" />
                </div>

                {/* Center icon */}
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-xl glow animate-float">
                    <BookOpen className="h-16 w-16 md:h-20 md:w-20 text-primary-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">The Holy Beacon</p>
                    <p className="text-sm text-muted-foreground">Your guide to Scripture</p>
                  </div>
                </div>
              </div>

              {/* Floating feature badges */}
              <div className="absolute -top-4 -right-4 glass px-4 py-2 rounded-lg shadow-lg animate-float animation-delay-200">
                <p className="text-sm font-medium">Personalized Plans</p>
              </div>
              <div className="absolute -bottom-4 -left-4 glass px-4 py-2 rounded-lg shadow-lg animate-float animation-delay-400">
                <p className="text-sm font-medium">Smart Insights</p>
              </div>
              <div className="absolute top-1/2 -right-8 glass px-4 py-2 rounded-lg shadow-lg animate-float animation-delay-600">
                <p className="text-sm font-medium">Daily Growth</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
