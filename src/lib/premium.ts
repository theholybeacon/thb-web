/**
 * Single source of truth for whether a user has premium access.
 *
 * Used by both the client (LoggedUserContext) and server-side enforcement
 * (requirePremiumUserSS) so the rule can never drift between the two.
 *
 * Two independent ways to be premium:
 *  - a Stripe `subscription` row with status "active" or "trialing" — a
 *    `trialing` subscription counts, trial users get full access;
 *  - the `user.lifetimePremium` flag: a comp tier granted out-of-band by
 *    scripts/grant-lifetime.ts. It is deliberately independent of Stripe, so a
 *    lifetime user has NO subscription row and no billing customer at all.
 *
 * Prefer `isPremiumUser` — `isPremiumStatus` only knows about the Stripe half
 * and will report false for a lifetime user.
 */
const PREMIUM_STATUSES = new Set(["active", "trialing"]);

export function isPremiumStatus(status: string | null | undefined): boolean {
  return status != null && PREMIUM_STATUSES.has(status);
}

export function isPremiumUser(input: {
  status?: string | null;
  lifetimePremium?: boolean | null;
}): boolean {
  return input.lifetimePremium === true || isPremiumStatus(input.status ?? null);
}
