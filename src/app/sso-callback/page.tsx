"use client";

import { useEffect, useRef } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "@/lib/toast";

export default function SSOCallbackPage() {
  const { handleRedirectCallback } = useClerk();
  const router = useRouter();
  const tCommon = useTranslations("common");
  // The OAuth params can only be consumed once; StrictMode double-runs effects.
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    async function handleCallback() {
      try {
        await handleRedirectCallback({
          // Fallbacks only: the redirectUrlComplete passed to
          // authenticateWithRedirect (which carries redirect_url) wins.
          signInFallbackRedirectUrl: "/home",
          signUpFallbackRedirectUrl: "/home",
          // Keep the edge cases (sign-in ↔ sign-up transfer, expired attempt)
          // on our own pages instead of the hosted Account Portal.
          signInUrl: "/auth/login",
          signUpUrl: "/auth/sign-up",
          // Clerk still needs a username to finish an OAuth sign-up. Without
          // this, clerk-js sends the user to its hosted Account Portal to pick
          // one; this keeps that step on our own domain.
          continueSignUpUrl: "/auth/complete-profile",
        });
      } catch (err) {
        console.error("SSO callback error:", err);
        toast.error(tCommon("error"));
        router.replace("/auth/login");
      }
    }

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once; the callback consumes the OAuth params
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
