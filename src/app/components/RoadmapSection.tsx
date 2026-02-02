"use client";

import { useMemo } from "react";
import { CheckCircle2, Clock4, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

interface Phase {
  status: "current" | "upcoming";
  timeline: string;
  title: string;
  description: string;
  features: { text: string; done: boolean }[];
  side: "left" | "right";
}

export function RoadmapSection() {
  const t = useTranslations("landing.roadmap");

  const phases: Phase[] = useMemo(() => {
    const phasesData = t.raw("phases") as Array<{
      timeline: string;
      title: string;
      description: string;
      features: string[];
    }>;

    return phasesData.map((phase, index) => ({
      status: index === 0 ? "current" : "upcoming",
      timeline: phase.timeline,
      title: phase.title,
      description: phase.description,
      features: phase.features.map((text) => ({
        text,
        done: index === 0, // First phase features are done
      })),
      side: index % 2 === 0 ? "left" : "right",
    })) as Phase[];
  }, [t]);

  return (
    <section id="roadmap" className="relative w-full py-16 md:py-24 lg:py-32 bg-secondary/30 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="container relative px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm text-primary animate-fade-down opacity-0">
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">{t("badge")}</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl animate-fade-up opacity-0 animation-delay-100">
              {t("title")} <span className="gradient-text">{t("titleHighlight")}</span>
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed animate-fade-up opacity-0 animation-delay-200">
              {t("description")}
            </p>
          </div>
        </div>

        <div className="mt-16 relative">
          {/* Timeline line - hidden on mobile, shown on md+ */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />

          {phases.map((phase, index) => (
            <div
              key={phase.title}
              className="relative mb-16 last:mb-0 animate-fade-up opacity-0"
              style={{ animationDelay: `${300 + index * 150}ms` }}
            >
              {/* Timeline dot */}
              <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 -mt-1 w-4 h-4 rounded-full bg-primary/40 border-4 border-background z-10 items-center justify-center">
                {phase.status === "current" && (
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
              </div>

              <div className={`flex flex-col md:flex-row items-center gap-8 ${phase.side === "right" ? "md:flex-row-reverse" : ""}`}>
                {/* Content side */}
                <div className={`w-full md:w-1/2 ${phase.side === "left" ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                  <div className="inline-flex items-center gap-2 rounded-full bg-secondary border border-border px-3 py-1 text-sm text-secondary-foreground mb-3">
                    <Clock4 className="h-4 w-4" />
                    <span>{phase.timeline}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{phase.title}</h3>
                  <p className="text-muted-foreground">{phase.description}</p>
                </div>

                {/* Features card side */}
                <div className={`w-full md:w-1/2 ${phase.side === "left" ? "md:pl-12" : "md:pr-12"}`}>
                  <div className="glass rounded-xl p-5 shadow-lg hover-lift transition-all duration-300">
                    <ul className="space-y-3">
                      {phase.features.map((feature) => (
                        <li
                          key={feature.text}
                          className={`flex items-center gap-3 ${phase.side === "right" ? "md:flex-row-reverse md:text-right" : ""}`}
                        >
                          {feature.done ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                          ) : (
                            <Clock4 className="h-5 w-5 text-muted-foreground shrink-0" />
                          )}
                          <span className={feature.done ? "" : "text-muted-foreground"}>{feature.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
