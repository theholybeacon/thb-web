"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLoggedUserContext } from "@/app/state/LoggedUserContext";
import { track } from "@/lib/analytics";

/**
 * Shown to users on a card-less free trial, nudging them to add a payment
 * method (via the Stripe billing portal) so premium access continues when the
 * trial ends. Renders nothing for non-trialing users.
 */
export function TrialBanner() {
  const t = useTranslations("subscription");
  const { subscriptionStatus } = useLoggedUserContext();
  const [loading, setLoading] = useState(false);

  if (subscriptionStatus !== "trialing") return null;

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
