"use client";

import { Button } from "@/components/ui/button";
import { Check, Eye, FlameIcon as Fire, Footprints, Gift, Users, X, Sparkles, LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

interface PlanFeature {
  text: string;
  included: boolean;
  gift?: boolean;
}

interface Plan {
  name: string;
  quote: string;
  price: string;
  period?: string;
  annual?: string;
  icon: LucideIcon;
  features: PlanFeature[];
  cta: string;
  variant: "outline" | "default" | "secondary";
  popular: boolean;
}

const plans: Plan[] = [
  {
    name: "The Glimpse",
    quote: '"Taste and see..." — Psalm 34:8',
    price: "Free",
    icon: Eye,
    features: [
      { text: "Read-only access to the Chronological Bible (text only)", included: true },
      { text: "No AI Study Plans", included: false },
      { text: "No Smart Links or Contextual Layers", included: false },
      { text: "No Audio or Typing Mode", included: false },
    ],
    cta: "Sign Up Free",
    variant: "outline" as const,
    popular: false,
  },
  {
    name: "The Walk",
    quote: '"Walk in the way of love..." — Ephesians 5:2',
    price: "$9",
    period: "/month",
    annual: "or $90/year (save $18)",
    icon: Footprints,
    features: [
      { text: "Full access to AI Study Plans (up to 3 active)", included: true },
      { text: "Entire Chronological Bible with Smart Links", included: true },
      { text: "Reading, Typing, and Audio Modes", included: true },
      { text: "20 Monthly Verse Images via AI", included: true },
      { text: "Join Study Circles & Community Discussions", included: true },
      { text: "Add 1 person to your subscription", included: true, gift: true },
    ],
    cta: "Subscribe Now",
    variant: "default" as const,
    popular: true,
  },
  {
    name: "The Fire",
    quote: '"His Word burns in my heart like a fire..." — Jeremiah 20:9',
    price: "$39",
    period: "/month",
    annual: "or $399/year (save $69)",
    icon: Fire,
    features: [
      { text: "Unlimited AI Study Plans with deep-dive options", included: true },
      { text: "Creator Mode – Build & publish custom Study Plans", included: true },
      { text: "Multiple Bible versions & translation comparisons", included: true },
      { text: "Unlimited AI Image Generation", included: true },
      { text: "Lead your own Study Circles & track engagement", included: true },
      { text: "Add 1 person to your subscription", included: true, gift: true },
    ],
    cta: "Upgrade to Premium",
    variant: "secondary" as const,
    popular: false,
  },
];

export function PricingSection() {
  const t = useTranslations("landing.pricing");

  return (
    <section id="pricing" className="relative w-full py-16 md:py-24 lg:py-32 bg-secondary/30 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

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

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`group relative flex flex-col rounded-2xl border bg-card shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-2 animate-fade-up opacity-0 ${
                plan.popular ? "border-primary/50 md:scale-105" : ""
              }`}
              style={{ animationDelay: `${300 + index * 100}ms` }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full shadow-lg glow-sm">
                    {t("mostPopular")}
                  </div>
                </div>
              )}

              {/* Hover glow */}
              <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                plan.popular ? "bg-gradient-to-br from-primary/10 to-accent/10" : "bg-gradient-to-br from-primary/5 to-transparent"
              }`} />

              <div className="relative p-6 pt-8">
                {/* Icon */}
                <div className="flex items-center justify-center mb-4">
                  <div className={`rounded-2xl p-3 transition-all duration-300 group-hover:scale-110 ${
                    plan.popular ? "bg-primary/10" : "bg-secondary"
                  }`}>
                    <plan.icon className={`h-8 w-8 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                </div>

                {/* Name & Quote */}
                <h3 className="text-center text-2xl font-bold">{plan.name}</h3>
                <div className="mt-1 text-center text-sm text-muted-foreground italic">
                  {plan.quote}
                </div>

                {/* Price */}
                <div className="mt-6 text-center">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                  {plan.annual && (
                    <div className="mt-1 text-sm text-muted-foreground">{plan.annual}</div>
                  )}
                </div>

                {/* Features */}
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-2">
                      {feature.included ? (
                        feature.gift ? (
                          <Gift className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        ) : (
                          <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        )
                      ) : (
                        <X className="h-5 w-5 text-destructive/50 shrink-0 mt-0.5" />
                      )}
                      <span className={`${feature.included ? "" : "text-muted-foreground"} ${feature.gift ? "font-medium" : ""}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="relative mt-auto p-6 pt-0">
                {plan.features.some(f => f.gift) && (
                  <div className="text-center text-xs text-muted-foreground mb-3">
                    <span className="flex items-center justify-center gap-1">
                      <Gift className="h-3 w-3" />
                      <span>{t("canBeGifted")}</span>
                    </span>
                  </div>
                )}
                <Button
                  className={`w-full transition-all duration-300 ${
                    plan.popular ? "bg-primary hover:bg-primary/90 glow-sm hover:glow" : ""
                  }`}
                  variant={plan.variant}
                >
                  {plan.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Sponsorship Section */}
        <div className="mt-16 glass rounded-2xl p-8 shadow-xl relative overflow-hidden animate-fade-up opacity-0 animation-delay-600">
          {/* Coming Soon Ribbon */}
          <div className="absolute -right-12 top-6 bg-primary text-primary-foreground font-bold py-1.5 px-12 transform rotate-45 shadow-lg z-10 text-sm">
            {t("comingSoon")}
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm text-primary mb-4">
              <Gift className="h-4 w-4" />
              <span className="font-medium">{t("communityProgram")}</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">{t("sponsorship")}</h3>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              {t("sponsorshipDesc")}
            </p>
            <p className="text-xs text-muted-foreground mt-2 italic">
              {t("simulatedNote")}
            </p>
          </div>

          {/* Queue Visualization */}
          <div className="mb-10 relative">
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000"
                style={{ width: "65%" }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>0</span>
              <span>{t("currentQueue", { count: 42 })}</span>
              <span>100</span>
            </div>

            {/* Queue Stats */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              {[
                { value: "42", label: t("peopleInQueue") },
                { value: "128", label: t("sponsorshipsGifted") },
                { value: "14", label: t("avgWaitTime") },
              ].map((stat) => (
                <div key={stat.label} className="bg-background/50 p-4 rounded-xl border border-border/50 hover-lift transition-all duration-300">
                  <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-6 justify-between">
            <div className="flex-1 max-w-md bg-background/50 p-6 rounded-xl border border-border/50 hover-lift transition-all duration-300">
              <h4 className="text-xl font-bold mb-2">{t("needSubscription")}</h4>
              <p className="text-muted-foreground mb-4">
                {t("needSubscriptionDesc")}
              </p>
              <Button className="w-full" variant="outline">
                <Users className="mr-2 h-5 w-5" />
                <span>{t("joinQueue")}</span>
              </Button>
            </div>

            <div className="flex-1 max-w-md bg-primary/5 p-6 rounded-xl border border-primary/20 hover-lift transition-all duration-300">
              <h4 className="text-xl font-bold mb-2">{t("becomeSponsor")}</h4>
              <p className="text-muted-foreground mb-4">
                {t("becomeSponsorDesc")}
              </p>
              <Button className="w-full bg-primary hover:bg-primary/90 glow-sm hover:glow transition-all duration-300">
                <Gift className="mr-2 h-5 w-5" />
                <span>{t("giftSubscriptions")}</span>
              </Button>
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center gap-4 italic text-sm text-muted-foreground">
              <span>
                &quot;Here is where your awesome testimonial will appear after you&apos;ve experienced The Holy Beacon&apos;s
                sponsorship program.&quot;
              </span>
              <span>—</span>
              <span>Future Sponsored Member</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
