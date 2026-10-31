"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, Sparkles, Compass } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function HeroSection() {
  const t = useTranslations("landing.hero");
  const root = useRef<HTMLElement>(null);

  // The entrance: badge, then the heading line by line, then the rest; the
  // beacon lights up alongside and leans toward the pointer. Every piece
  // starts at opacity 0 (opacity-0) so nothing flashes before it runs.
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo("[data-hero='badge']", { y: -14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
        .fromTo("[data-hero='line']", { y: 48, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 1, stagger: 0.14 }, "-=0.3")
        .fromTo("[data-hero='rise']", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.1 }, "-=0.6")
        .fromTo("[data-hero='beacon']", { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.4, ease: "expo.out" }, 0.15)
        .fromTo("[data-hero='chip']", { opacity: 0 }, { opacity: 1, duration: 0.6, stagger: 0.15 }, "-=0.8");

      const beacon = root.current?.querySelector<HTMLElement>("[data-hero='beacon']");
      if (!beacon) return;
      const x = gsap.quickTo(beacon, "x", { duration: 1.2, ease: "power3.out" });
      const y = gsap.quickTo(beacon, "y", { duration: 1.2, ease: "power3.out" });
      const lean = (e: PointerEvent) => {
        x((e.clientX / window.innerWidth - 0.5) * 24);
        y((e.clientY / window.innerHeight - 0.5) * 24);
      };
      window.addEventListener("pointermove", lean);
      return () => window.removeEventListener("pointermove", lean);
    });
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set("[data-hero]", { opacity: 1 });
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section ref={root} className="relative w-full py-16 md:py-28 lg:py-36 xl:py-48 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

      {/* Decorative floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-highlight/10 rounded-full blur-3xl animate-pulse-glow animation-delay-500" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container relative px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left content */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-4">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary border border-primary/20 opacity-0" data-hero="badge">
                <Sparkles className="h-4 w-4" />
                <span className="font-medium">{t("badge")}</span>
              </div>

              {/* Heading */}
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/[1.1]">
                <span className="inline-block opacity-0" data-hero="line">{t("title")}</span>{" "}
                <span className="inline-block gradient-text opacity-0" data-hero="line">{t("titleHighlight")}</span>
              </h1>

              {/* Description */}
              <p className="max-w-[600px] text-muted-foreground text-lg md:text-xl opacity-0" data-hero="rise">
                {t("description")}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 min-[400px]:flex-row opacity-0" data-hero="rise">
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-primary hover:bg-primary/90 glow-sm hover:glow transition-all duration-300 group">
                  <span>{t("cta")}</span>
                  <Compass className="ml-2 h-4 w-4 transition-transform group-hover:rotate-45" />
                </Button>
              </Link>
              <Link href="/bible">
                <Button size="lg" variant="outline" className="hover-lift">
                  {t("exploreFree")}
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-4 opacity-0" data-hero="rise">
              <div className="space-y-1">
                <p className="text-2xl font-bold gradient-text">400+</p>
                <p className="text-sm text-muted-foreground">{t("translations")}</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold gradient-text">3,000+</p>
                <p className="text-sm text-muted-foreground">{t("characters")}</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold gradient-text">3</p>
                <p className="text-sm text-muted-foreground">{t("waysToStudy")}</p>
              </div>
            </div>
          </div>

          {/* Right decorative element */}
          <div className="relative flex items-center justify-center opacity-0" data-hero="beacon">
            {/* Main beacon/book visual */}
            <div className="relative">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 to-highlight/20 blur-2xl scale-150 animate-pulse-glow" />

              {/* Main circle */}
              <div className="relative w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full bg-gradient-to-br from-primary/10 to-highlight/5 border border-primary/20 flex items-center justify-center">
                {/* Inner ring */}
                <div className="absolute inset-4 rounded-full border border-primary/10 animate-[spin_30s_linear_infinite]">
                  {/* Orbiting dots */}
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary/60" />
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-highlight/60" />
                </div>

                {/* Center icon */}
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-primary to-highlight shadow-xl glow animate-float">
                    <BookOpen className="h-16 w-16 md:h-20 md:w-20 text-primary-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">The Holy Beacon</p>
                    <p className="text-sm text-muted-foreground">{t("yourGuide")}</p>
                  </div>
                </div>
              </div>

              {/* Floating feature badges */}
              <div className="absolute -top-4 -right-4 glass px-4 py-2 rounded-lg shadow-lg animate-float animation-delay-200 opacity-0" data-hero="chip">
                <p className="text-sm font-medium">{t("peopleInPassage")}</p>
              </div>
              <div className="absolute -bottom-4 -left-4 glass px-4 py-2 rounded-lg shadow-lg animate-float animation-delay-400 opacity-0" data-hero="chip">
                <p className="text-sm font-medium">{t("originalLanguage")}</p>
              </div>
              <div className="absolute top-1/2 -right-8 glass px-4 py-2 rounded-lg shadow-lg animate-float animation-delay-600 opacity-0" data-hero="chip">
                <p className="text-sm font-medium">{t("verseNotes")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
