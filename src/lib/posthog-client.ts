"use client";

import posthog from "posthog-js";

/**
 * Starts PostHog in the browser once. Called by the root PostHogProvider and
 * again by global-error, which replaces the root layout (and so the provider)
 * when the layout itself crashes. No-ops when NEXT_PUBLIC_POSTHOG_KEY is unset.
 */
export function initPostHog(): boolean {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (typeof window === "undefined" || !key) return false;
  if (posthog.__loaded) return true;

  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    capture_pageview: true,
    capture_pageleave: true,
    person_profiles: "identified_only",
    // The browser-wide fallback: uncaught errors and unhandled promise
    // rejections that no error boundary or try/catch saw.
    capture_exceptions: {
      capture_unhandled_errors: true,
      capture_unhandled_rejections: true,
      capture_console_errors: false,
    },
  });
  // Lets PostHog filter out errors and events from dev machines and previews.
  posthog.register({
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV,
  });
  return true;
}

/** A short code the user can quote to support, searchable in PostHog as `error_ref`. */
export function newErrorRef(): string {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Reports a caught error to PostHog Error Tracking, with what the user was
 * doing (`area`, e.g. "login") and anything else that helps reproduce it.
 * Never pass passwords, emails or other personal data in `context`.
 */
export function reportClientError(error: unknown, context: Record<string, unknown> = {}): void {
  if (!initPostHog()) return;
  posthog.captureException(error instanceof Error ? error : new Error(describe(error)), {
    path: window.location.pathname,
    ...context,
  });
}

function describe(value: unknown): string {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}
