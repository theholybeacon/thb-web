"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { CreditCard, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { track } from "@/lib/analytics";
import { isPremiumStatus, isWelcomePremiumActive } from "@/lib/premium";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Shown to users on a card-less free trial, nudging them to add a payment
 * method (via the Stripe billing portal) so premium access continues when the
 * trial ends. During the welcome week (premium with no Stripe side at all) it
 * counts down the days left instead and links to the plans. Renders nothing
 * for everyone else.
 */
export function TrialBanner() {
  const t = useTranslations("subscription");
  const { subscriptionStatus, user } = useLoggedUserContext();
  const [loading, setLoading] = useState(false);

  if (subscriptionStatus !== "trialing") {
    const inWelcomeWeek =
      user != null &&
      !user.lifetimePremium &&
      !isPremiumStatus(subscriptionStatus) &&
      isWelcomePremiumActive(user.welcomePremiumEndsAt);
    return inWelcomeWeek ? <WelcomeWeekBanner endsAt={new Date(user.welcomePremiumEndsAt!)} /> : null;
  }

  const handleAddPayment = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await response.json();
      if (data.url) {
        track("billing_portal_opened", { source: "trial_banner" });
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error opening billing portal:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 border-b bg-primary/10 px-4 py-2 text-sm">
      <span className="flex items-center gap-2 text-foreground">
        <CreditCard className="h-4 w-4 shrink-0 text-primary" />
        {t("trialBanner")}
      </span>
      <Button size="sm" variant="default" onClick={handleAddPayment} disabled={loading}>
        {loading ? t("opening") : t("addPaymentMethod")}
      </Button>
    </div>
  );
}

function WelcomeWeekBanner({ endsAt }: { endsAt: Date }) {
  const t = useTranslations("welcomePremium");
  const daysLeft = Math.max(1, Math.ceil((endsAt.getTime() - Date.now()) / DAY_MS));

  return (
    <div data-testid="welcome-premium-banner" className="flex flex-wrap items-center justify-center gap-3 border-b bg-primary/10 px-4 py-2 text-sm">
      <span className="flex items-center gap-2 text-foreground">
        <Crown className="h-4 w-4 shrink-0 text-primary" />
        {t("bannerDays", { count: daysLeft })}
      </span>
      <Button size="sm" variant="default" asChild>
        <Link href="/subscription">{t("bannerKeep")}</Link>
      </Button>
    </div>
  );
}
