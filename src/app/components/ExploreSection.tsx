"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Compass,
  BookOpen,
  ChevronRight,
  Globe,
  Search,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sample books for the interactive preview
const sampleBooks = [
  { name: "Genesis", abbr: "GEN", chapters: 50 },
  { name: "Exodus", abbr: "EXO", chapters: 40 },
  { name: "Leviticus", abbr: "LEV", chapters: 27 },
  { name: "Numbers", abbr: "NUM", chapters: 36 },
  { name: "Deuteronomy", abbr: "DEU", chapters: 34 },
];

// Sample verse for the preview
const sampleVerse = {
  book: "Genesis",
  chapter: 1,
  verses: [
    { num: 1, text: "In the beginning God created the heaven and the earth." },
    { num: 2, text: "And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters." },
    { num: 3, text: "And God said, Let there be light: and there was light." },
    { num: 4, text: "And God saw the light, that it was good: and God divided the light from the darkness." },
  ],
};

// Sample Bible translations
const sampleBibles = [
  { name: "King James Version", abbr: "KJV", lang: "English" },
  { name: "New International Version", abbr: "NIV", lang: "English" },
  { name: "Reina-Valera 1960", abbr: "RVR60", lang: "Spanish" },
];

type PreviewState = "selector" | "reader";

export function ExploreSection() {
  const t = useTranslations("landing.explore");
  const tCommon = useTranslations("common");
  const [previewState, setPreviewState] = useState<PreviewState>("selector");

  const handleBookClick = () => {
    setPreviewState("reader");
  };

  const resetPreview = () => {
    setPreviewState("selector");
  };

  return (
    <section id="explore" className="relative w-full py-16 md:py-24 lg:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse animation-delay-1000" />

      <div className="container relative px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm text-primary animate-fade-down opacity-0">
            <Compass className="h-4 w-4" />
            <span className="font-medium">{t("badge")}</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl animate-fade-up opacity-0 animation-delay-100">
            {t("title")} <span className="gradient-text">{t("titleHighlight")}</span>
          </h2>
          <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed animate-fade-up opacity-0 animation-delay-200">
            {t("description")}
          </p>
        </div>

        {/* Main content: Features + Interactive Preview */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Features list */}
          <div className="space-y-6 animate-fade-right opacity-0 animation-delay-300">
            <div className="space-y-4">
              {[
                {
                  icon: Globe,
                  title: t("multipleTranslations"),
                  description: t("multipleTranslationsDesc"),
                },
                {
                  icon: BookOpen,
                  title: t("cleanReading"),
                  description: t("cleanReadingDesc"),
                },
                {
                  icon: Search,
                  title: t("easyNavigation"),
                  description: t("easyNavigationDesc"),
                },
                {
                  icon: Sparkles,
                  title: t("seoOptimized"),
                  description: t("seoOptimizedDesc"),
                },
              ].map((feature, index) => (
                <div
                  key={feature.title}
                  className="flex gap-4 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 hover:bg-card transition-all duration-300"
                  style={{ animationDelay: `${400 + index * 100}ms` }}
                >
                  <div className="flex-shrink-0 rounded-lg bg-primary/10 p-2.5 h-fit">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Link href="/bible">
              <Button size="lg" className="w-full sm:w-auto group">
                <Compass className="mr-2 h-5 w-5" />
                {t("startExploring")}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {/* Right: Interactive Preview */}
          <div className="animate-fade-left opacity-0 animation-delay-400">
            <div className="relative rounded-2xl border bg-card shadow-2xl overflow-hidden">
              {/* Mock browser header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-md bg-background text-xs text-muted-foreground">
                    theholybeacon.com/bible
                  </div>
                </div>
              </div>

              {/* Content area */}
              <div className="h-[400px] overflow-hidden">
                {previewState === "selector" ? (
                  /* Bible Selector Preview */
                  <div className="p-6 space-y-4 animate-fade-in">
                    {/* Search bar mock */}
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border bg-background">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{t("searchBibles")}</span>
                      </div>
                      <div className="flex gap-1">
                        {[{ key: "all", label: tCommon("all") }, { key: "en", label: "EN" }, { key: "es", label: "ES" }].map((lang) => (
                          <button
                            key={lang.key}
                            className={cn(
                              "px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                              lang.key === "all" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                            )}
                          >
                            {lang.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bible cards */}
                    <div className="grid grid-cols-1 gap-3">
                      {sampleBibles.map((bible) => (
                        <button
                          key={bible.abbr}
                          onClick={() => handleBookClick()}
                          className="flex items-center justify-between p-4 rounded-lg border bg-background hover:border-primary/50 hover:bg-accent/50 transition-all text-left group"
                        >
                          <div>
                            <p className="font-medium group-hover:text-primary transition-colors">
                              {bible.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {bible.abbr} • {bible.lang}
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </button>
                      ))}
                    </div>

                    <p className="text-center text-xs text-muted-foreground pt-2">
                      {t("clickToPreview")}
                    </p>
                  </div>
                ) : (
                  /* Reader Preview */
                  <div className="flex h-full animate-fade-in">
                    {/* Sidebar */}
                    <div className="w-48 border-r bg-muted/30 p-3 space-y-2">
                      <button
                        onClick={resetPreview}
                        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground mb-3"
                      >
                        <ChevronRight className="h-3 w-3 rotate-180" />
                        {t("backToBibles")}
                      </button>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                        {t("oldTestament")}
                      </p>
                      {sampleBooks.map((book) => (
                        <div
                          key={book.abbr}
                          className={cn(
                            "w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors",
                            book.abbr === "GEN"
                              ? "bg-primary/10 text-primary font-medium"
                              : "hover:bg-muted"
                          )}
                        >
                          <span>{book.name}</span>
                          <span className="text-muted-foreground">{book.chapters}</span>
                        </div>
                      ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 overflow-y-auto">
                      <h3 className="text-xl font-serif font-semibold text-center mb-4 pb-3 border-b">
                        {sampleVerse.book} {sampleVerse.chapter}
                      </h3>
                      <div className="space-y-3">
                        {sampleVerse.verses.map((verse) => (
                          <p key={verse.num} className="text-sm leading-relaxed">
                            <sup className="text-xs font-semibold text-primary mr-1">
                              {verse.num}
                            </sup>
                            {verse.text}
                          </p>
                        ))}
                        <p className="text-sm text-muted-foreground">...</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-8 mt-6">
              {[
                { value: "50+", label: t("translations") },
                { value: "66", label: t("books") },
                { value: t("free"), label: t("forever") },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
