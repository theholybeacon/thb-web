/**
 * Single source of truth for whether a subscription status grants premium access.
 *
 * Used by both the client (LoggedUserContext) and server-side enforcement
 * (requirePremiumUserSS) so the rule can never drift between the two.
 *
 * A `trialing` subscription counts as premium — trial users get full access.
 *
 * Future "lifetime" tier: extend this module (e.g. a dedicated lifetime status
 * or a user flag) rather than re-introducing a hardcoded date cutoff.
 */
const PREMIUM_STATUSES = new Set(["active", "trialing"]);

export function isPremiumStatus(status: string | null | undefined): boolean {
  return status != null && PREMIUM_STATUSES.has(status);
}
