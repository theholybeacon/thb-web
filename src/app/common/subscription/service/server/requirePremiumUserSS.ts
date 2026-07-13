"use server";

import { auth } from "@clerk/nextjs/server";
import { User } from "../../../user/model/User";
import { userGetByAuthIdSS } from "../../../user/service/server/userGetByAuthIdSS";
import { subscriptionGetByUserIdSS } from "./subscriptionGetByUserIdSS";
import { isPremiumStatus } from "@/lib/premium";

/**
 * Server-side backstop for premium-gated data.
 *
 * Resolves the authenticated Clerk user to the local user row and enforces an
 * active/trialing subscription. The client-side PremiumGate is UX only — this is
 * the real access control. Callers should treat a thrown error as "no access".
 *
 * Throws "UNAUTHENTICATED" when there is no signed-in/known user, or
 * "PREMIUM_REQUIRED" when the user has no active or trialing subscription.
 */
export async function requirePremiumUserSS(): Promise<User> {
  const { userId: authId } = await auth();
  if (!authId) {
    throw new Error("UNAUTHENTICATED");
  }

  let user: User | null = null;
  try {
    user = await userGetByAuthIdSS(authId);
  } catch {
    throw new Error("UNAUTHENTICATED");
  }
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }

  const subscription = await subscriptionGetByUserIdSS(user.id);
  if (!isPremiumStatus(subscription?.status ?? null)) {
    throw new Error("PREMIUM_REQUIRED");
  }

  return user;
}
