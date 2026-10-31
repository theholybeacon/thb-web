"use client";

import { useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, BookOpen, Compass, MessagesSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const STEPS = [
  { key: "answer", icon: Compass },
  { key: "proposed", icon: Sparkles },
  { key: "shape", icon: MessagesSquare },
] as const;

const SAMPLE_READINGS = ["r1", "r2", "r3", "r4"] as const;

/**
 * How a new reader starts: a few questions at /welcome, then their first study
 * already proposed by the study builder, then shaped in conversation. The
 * steps and the sample conversation play in as the section scrolls into view.
 */
export function StartSection() {
  const t = useTranslations("landing.start");
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
      });
      tl.fromTo("[data-start='head']", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 })
        .fromTo("[data-start='line']", { scaleY: 0 }, { scaleY: 1, duration: 1.2, ease: "power2.inOut" }, "-=0.4")
        .fromTo("[data-start='step']", { x: -24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, stagger: 0.25 }, "<")
        .fromTo("[data-start='card']", { y: 40, opacity: 0, rotateX: 8 }, { y: 0, opacity: 1, rotateX: 0, duration: 1 }, "<0.2")
        .fromTo("[data-start='message']", { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.4")
        .fromTo("[data-start='reading']", { x: 16, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, stagger: 0.12 }, "-=0.2")
        .fromTo("[data-start='reply']", { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, stagger: 0.08, ease: "back.out(2)" }, "-=0.1");
    });
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set("[data-start]", { opacity: 1 });
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section ref={root} id="start" className="relative w-full overflow-hidden py-16 md:py-24 lg:py-32">
      <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="container relative px-4 md:px-6">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <div data-start="head" className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary opacity-0">
            <Compass className="h-4 w-4" />
            <span className="font-medium">{t("badge")}</span>
          </div>
          <h2 data-start="head" className="text-3xl font-bold tracking-tighter opacity-0 sm:text-4xl md:text-5xl">
            {t("title")} <span className="gradient-text">{t("titleHighlight")}</span>
          </h2>
          <p data-start="head" className="text-muted-foreground opacity-0 md:text-xl/relaxed">{t("description")}</p>
        </div>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* The three steps, joined by a line of light */}
          <div className="relative">
          <div data-start="line" aria-hidden className="absolute bottom-6 left-[1.35rem] top-6 w-px origin-top bg-gradient-to-b from-primary via-primary/40 to-transparent" />
          <ol className="relative space-y-10 pl-14">
            {STEPS.map(({ key, icon: Icon }, i) => (
              <li key={key} data-start="step" className="relative opacity-0">
                <div className="absolute -left-14 top-0 flex h-11 w-11 items-center justify-center rounded-full border border-primary/30 bg-background shadow-sm">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">{t("stepLabel", { n: i + 1 })}</p>
                <h3 className="mt-1 text-xl font-bold">{t(`steps.${key}.title`)}</h3>
                <p className="mt-1 text-muted-foreground">{t(`steps.${key}.description`)}</p>
              </li>
            ))}
            <li data-start="step" className="opacity-0">
              <Link href="/auth/sign-up">
                <Button size="lg" className="group glow-sm">
                  {t("cta")}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </li>
          </ol>
          </div>

          {/* A first conversation, as it opens */}
          <div className="[perspective:1200px]">
            <div data-start="card" className="glass rounded-2xl p-5 opacity-0 shadow-xl md:p-6">
              <div data-start="message" className="flex gap-3 opacity-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <p className="rounded-2xl rounded-tl-sm bg-secondary/60 px-4 py-3 text-sm leading-relaxed">{t("sample.message")}</p>
              </div>

              <div className="mt-4 rounded-xl border bg-background/60 p-4">
                <p className="text-sm font-semibold">{t("sample.planName")}</p>
                <p className="text-xs text-muted-foreground">{t("sample.planMeta")}</p>
                <ul className="mt-3 space-y-2">
                  {SAMPLE_READINGS.map((r, i) => (
                    <li key={r} data-start="reading" className="flex items-center gap-3 text-sm opacity-0">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{i + 1}</span>
                      <BookOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span>{t(`sample.readings.${r}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex flex-wrap justify-end gap-2">
                {(["shorter", "deeper", "ready"] as const).map((q) => (
                  <span key={q} data-start="reply" className="rounded-full border border-primary/30 px-3 py-1 text-xs text-primary opacity-0">
                    {t(`sample.replies.${q}`)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
