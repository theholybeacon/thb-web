import posthog from "posthog-js";
import { reportClientError } from "@/lib/posthog-client";

/**
 * Login funnel events, so failed sign-ins show up in PostHog:
 *   login_attempted → login_succeeded, or login_failed { reason, expected }.
 *
 * `expected` failures are the person's own (wrong password, unknown email).
 * Anything else means someone could not sign in through no fault of theirs, so
 * it is also reported to Error Tracking. Never send the email or password.
 */

export type LoginMethod = "password" | "google";

/** The step that failed: the credentials, the session after them, or the Google round trip. */
export type LoginStage = "credentials" | "activate_session" | "google_redirect" | "sso_callback" | "clerk_load";

const EXPECTED_CODES = new Set([
  "form_password_incorrect",
  "form_identifier_not_found",
  // Breached or expired password: the form sends them to reset it.
  "form_password_pwned",
  "needs_new_password",
]);

type ClerkApiError = { errors?: Array<{ code?: string; message?: string; longMessage?: string }> };

/** The first Clerk API error in `err`, or undefined when the failure wasn't Clerk's answer (offline, blocked, a bug). */
export function clerkErrorOf(err: unknown): { code: string; message?: string } | undefined {
  const first = (err as ClerkApiError | null)?.errors?.[0];
  return first?.code ? { code: first.code, message: first.longMessage || first.message } : undefined;
}

export function trackLoginAttempt(method: LoginMethod): void {
  posthog.capture("login_attempted", { method });
}

export function trackLoginSuccess(method: LoginMethod): void {
  posthog.capture("login_succeeded", { method });
}

export function trackLoginFailure({
  method,
  stage,
  reason,
  error,
}: {
  /** Unset when the failure happened before the person picked a method. */
  method?: LoginMethod;
  stage: LoginStage;
  reason: string;
  error?: unknown;
}): void {
  const expected = EXPECTED_CODES.has(reason);
  posthog.capture("login_failed", { method, stage, reason, expected });
  if (!expected) {
    reportClientError(error ?? new Error(`Login failed: ${reason}`), { area: "login", method, stage, reason });
  }
}

/**
 * Google sign-in leaves the app and comes back through /sso-callback, which
 * Clerk navigates away from as soon as it's done. So the success is counted
 * where the person lands: the login page marks the round trip here, and
 * LoggedUserContext reports login_succeeded once the signed-in user resolves.
 */
const GOOGLE_REDIRECT_KEY = "thb:google-login-pending";

export function markGoogleLoginPending(): void {
  try {
    sessionStorage.setItem(GOOGLE_REDIRECT_KEY, "1");
  } catch {
    // Storage blocked (private mode): the success just goes uncounted.
  }
}

/** True once after a Google round trip started by markGoogleLoginPending. */
export function consumeGoogleLoginPending(): boolean {
  try {
    const pending = sessionStorage.getItem(GOOGLE_REDIRECT_KEY) === "1";
    sessionStorage.removeItem(GOOGLE_REDIRECT_KEY);
    return pending;
  } catch {
    return false;
  }
}
