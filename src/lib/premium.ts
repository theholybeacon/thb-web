/**
 * Single source of truth for whether a user has premium access.
 *
 * Used by both the client (LoggedUserContext) and server-side enforcement
 * (requirePremiumUserSS) so the rule can never drift between the two.
 *
 * Three independent ways to be premium:
 *  - a Stripe `subscription` row with status "active" or "trialing" — a
 *    `trialing` subscription counts, trial users get full access;
 *  - the `user.lifetimePremium` flag: a comp tier granted out-of-band by
 *    scripts/grant-lifetime.ts. It is deliberately independent of Stripe, so a
 *    lifetime user has NO subscription row and no billing customer at all;
 *  - the welcome week, `user.welcomePremiumEndsAt` still in the future: seven
 *    days every reader gets once (welcomePremiumClaimSS). Like lifetime, it has
 *    no Stripe side at all.
 *
 * Prefer `isPremiumUser` — `isPremiumStatus` only knows about the Stripe half
 * and will report false for a lifetime user.
 */
const PREMIUM_STATUSES = new Set(["active", "trialing"]);

export function isPremiumStatus(status: string | null | undefined): boolean {
  return status != null && PREMIUM_STATUSES.has(status);
}

/** Seven days, the length of the welcome week. */
export const WELCOME_PREMIUM_DAYS = 7;

/**
 * Whether the welcome week is still running. Takes a string too: the client
 * reads the user row back from localStorage, where dates are ISO strings.
 */
export function isWelcomePremiumActive(
  endsAt: Date | string | null | undefined,
  now: Date = new Date()
): boolean {
  if (!endsAt) return false;
  return new Date(endsAt).getTime() > now.getTime();
}

export function isPremiumUser(input: {
  status?: string | null;
  lifetimePremium?: boolean | null;
  welcomePremiumEndsAt?: Date | string | null;
}): boolean {
  return (
    input.lifetimePremium === true ||
    isPremiumStatus(input.status ?? null) ||
    isWelcomePremiumActive(input.welcomePremiumEndsAt)
  );
}

/**
 * Whether signing in should start the welcome week now: the reader is not
 * premium any other way and has never had it. A paying subscriber or a
 * lifetime reader is not given it, and it is never given twice.
 */
export function isWelcomePremiumClaimable(input: {
  status?: string | null;
  lifetimePremium?: boolean | null;
  welcomePremiumEndsAt?: Date | string | null;
}): boolean {
  return input.welcomePremiumEndsAt == null && !isPremiumUser(input);
}
