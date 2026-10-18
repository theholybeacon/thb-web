"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { initPostHog } from "@/lib/posthog-client";

/**
 * Initializes PostHog on the client and provides it to the tree. No-ops when
 * NEXT_PUBLIC_POSTHOG_KEY is unset (safe for local dev). User identification is
 * driven from LoggedUserContext once the DB user resolves.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog();
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
