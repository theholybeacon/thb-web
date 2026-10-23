import { PostHog } from "posthog-node";

/**
 * Server-side error reporting to PostHog Error Tracking. Works in both the
 * Node.js and Edge runtimes (posthog-node picks its edge build there).
 *
 * The general fallback is wired in src/instrumentation.ts: every error that
 * escapes a server component, route handler, server action or the middleware
 * lands in reportServerError, and on Node.js uncaught exceptions and unhandled
 * rejections are captured too. Code that catches an error and recovers can
 * still call reportServerError itself so the failure isn't silent.
 */

let client: PostHog | null | undefined;

function getClient(): PostHog | null {
  if (client !== undefined) return client;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  client = key
    ? new PostHog(key, {
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
        flushAt: 1,
        flushInterval: 0,
        enableExceptionAutocapture: process.env.NEXT_RUNTIME === "nodejs",
      })
    : null;
  return client;
}

/** Turns on PostHog's process-wide capture of uncaught exceptions and rejections (Node.js only). */
export function startServerErrorAutocapture(): void {
  getClient();
}

export type ServerErrorContext = {
  /** The PostHog person the error happened to, when known. */
  distinctId?: string;
  [key: string]: unknown;
};

export async function reportServerError(error: unknown, { distinctId, ...context }: ServerErrorContext = {}): Promise<void> {
  const posthog = getClient();
  if (!posthog) return;
  try {
    const digest = (error as { digest?: unknown } | null)?.digest;
    await posthog.captureExceptionImmediate(error, distinctId, {
      // The same digest Next.js hands the browser's error screen, which shows it
      // as the error reference: it links what the user saw to this report.
      ...(typeof digest === "string" ? { error_ref: digest } : {}),
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
      runtime: process.env.NEXT_RUNTIME,
      ...context,
    });
  } catch (reportingError) {
    // Reporting must never take the request down with it.
    console.error("Failed to report error to PostHog:", reportingError);
  }
}

/**
 * The PostHog distinct id from the browser's PostHog cookie (ph_<key>_posthog),
 * so a server error is attached to the same person as their browser events:
 * their database id once LoggedUserContext identifies them, anonymous before.
 */
export function distinctIdFromCookies(cookieHeader: string | null | undefined): string | undefined {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!cookieHeader || !key) return undefined;
  const name = `ph_${key}_posthog=`;
  const raw = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(name))
    ?.slice(name.length);
  if (!raw) return undefined;
  try {
    const id = JSON.parse(decodeURIComponent(raw))?.distinct_id;
    return typeof id === "string" && id ? id : undefined;
  } catch {
    return undefined;
  }
}
