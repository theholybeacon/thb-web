"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Gift, Users, Sparkles, Crown, Book } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PriceData {
  id: string;
  amount: number | null;
  currency: string;
}

interface PricesResponse {
  monthly: PriceData | null;
  yearly: PriceData | null;
}

export function PricingSection() {
  const t = useTranslations("landing.pricing");
  const tPremium = useTranslations("premium");
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("year");
  const [prices, setPrices] = useState<PricesResponse | null>(null);
  const [pricesLoading, setPricesLoading] = useState(true);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const response = await fetch("/api/stripe/prices");
        const data = await response.json();
        setPrices(data);
      } catch (error) {
        console.error("Error fetching prices:", error);
      } finally {
        setPricesLoading(false);
      }
    }
    fetchPrices();
  }, []);

  const selectedPrice = billingInterval === "year" ? prices?.yearly : prices?.monthly;

  const formatPrice = (price: PriceData | null | undefined) => {
    if (!price || price.amount === null) return "...";
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: price.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price.amount / 100);
  };

  const freeFeatures = [
    t("freeFeatures.explore"),
    t("freeFeatures.translations"),
    t("freeFeatures.noAccount"),
  ];

  const premiumFeatures = [
    tPremium("features.studies"),
    tPremium("features.sessions"),
    tPremium("features.explore"),
    t("premiumFeatures.gift"),
  ];

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

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div
            className="group relative flex flex-col rounded-2xl border bg-card shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-2 animate-fade-up opacity-0"
            style={{ animationDelay: "300ms" }}
          >
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 to-transparent" />

            <div className="relative p-6 pt-8">
              <div className="flex items-center justify-center mb-4">
                <div className="rounded-2xl p-3 bg-secondary transition-all duration-300 group-hover:scale-110">
                  <Book className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>

              <h3 className="text-center text-2xl font-bold">{t("freePlan.name")}</h3>
              <div className="mt-1 text-center text-sm text-muted-foreground italic">
                {t("freePlan.quote")}
              </div>

              <div className="mt-6 text-center">
                <span className="text-4xl font-bold">{t("freePlan.price")}</span>
                <div className="mt-1 text-sm text-muted-foreground">{t("freePlan.forever")}</div>
              </div>

              <ul className="mt-6 space-y-3">
                {freeFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mt-auto p-6 pt-0">
              <Link href="/bible">
                <Button className="w-full" variant="outline">
                  {t("freePlan.cta")}
                </Button>
              </Link>
            </div>
          </div>

          {/* Premium Plan */}
          <div
            className="group relative flex flex-col rounded-2xl border border-primary/50 bg-card shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-2 md:scale-105 animate-fade-up opacity-0"
            style={{ animationDelay: "400ms" }}
          >
            {/* Popular badge */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
              <div className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full shadow-lg glow-sm">
                {t("mostPopular")}
              </div>
            </div>

            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/10 to-accent/10" />

            <div className="relative p-6 pt-8">
              <div className="flex items-center justify-center mb-4">
                <div className="rounded-2xl p-3 bg-primary/10 transition-all duration-300 group-hover:scale-110">
                  <Crown className="h-8 w-8 text-primary" />
                </div>
              </div>

              <h3 className="text-center text-2xl font-bold">{t("premiumPlan.name")}</h3>
              <div className="mt-1 text-center text-sm text-muted-foreground italic">
                {t("premiumPlan.quote")}
              </div>

              {/* Billing interval toggle */}
              <div className="flex gap-2 p-1 bg-muted rounded-lg mt-6">
                <button
                  onClick={() => setBillingInterval("month")}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
                    billingInterval === "month"
                      ? "bg-background shadow-sm"
                      : "hover:bg-background/50"
                  )}
                >
                  {tPremium("monthly")}
                </button>
                <button
                  onClick={() => setBillingInterval("year")}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors relative",
                    billingInterval === "year"
                      ? "bg-background shadow-sm"
                      : "hover:bg-background/50"
                  )}
                >
                  {tPremium("yearly")}
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {tPremium("save")}
                  </span>
                </button>
              </div>

              <div className="mt-4 text-center">
                <span className="text-4xl font-bold">
                  {pricesLoading ? "..." : formatPrice(selectedPrice)}
                </span>
                <span className="text-muted-foreground">
                  /{billingInterval === "year" ? t("premiumPlan.year") : t("premiumPlan.month")}
                </span>
              </div>

              <ul className="mt-6 space-y-3">
                {premiumFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mt-auto p-6 pt-0">
              <div className="text-center text-xs text-muted-foreground mb-3">
                <span className="flex items-center justify-center gap-1">
                  <Gift className="h-3 w-3" />
                  <span>{t("canBeGifted")}</span>
                </span>
              </div>
              <Link href="/sign-up">
                <Button className="w-full bg-primary hover:bg-primary/90 glow-sm hover:glow transition-all duration-300">
                  {t("premiumPlan.cta")}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Sponsorship Section */}
        <div className="mt-16 glass rounded-2xl p-8 shadow-xl relative overflow-hidden animate-fade-up opacity-0 animation-delay-600">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm text-primary mb-4">
              <Gift className="h-4 w-4" />
              <span className="font-medium">{t("communityProgram")}</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">{t("sponsorship")}</h3>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              {t("sponsorshipDesc")}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <div className="flex-1 max-w-md bg-background/50 p-6 rounded-xl border border-border/50 hover-lift transition-all duration-300">
              <h4 className="text-xl font-bold mb-2">{t("needSubscription")}</h4>
              <p className="text-muted-foreground mb-4">
                {t("needSubscriptionDesc")}
              </p>
              <Link href="/sponsorship">
                <Button className="w-full" variant="outline">
                  <Users className="mr-2 h-5 w-5" />
                  <span>{t("joinQueue")}</span>
                </Button>
              </Link>
            </div>

            <div className="flex-1 max-w-md bg-primary/5 p-6 rounded-xl border border-primary/20 hover-lift transition-all duration-300">
              <h4 className="text-xl font-bold mb-2">{t("becomeSponsor")}</h4>
              <p className="text-muted-foreground mb-4">
                {t("becomeSponsorDesc")}
              </p>
              <Link href="/gift">
                <Button className="w-full bg-primary hover:bg-primary/90 glow-sm hover:glow transition-all duration-300">
                  <Gift className="mr-2 h-5 w-5" />
                  <span>{t("giftSubscriptions")}</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
