'use client';
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useRef } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { LoggedUserContextType, LoggedUserState, WelcomeGrant } from './LoggedUserContextType';
import { userGetByAuthIdSS } from '../common/user/service/server/userGetByAuthIdSS';
import { userGetByEmailSS } from '../common/user/service/server/userGetByEmailSS';
import { userCreateSS } from '../common/user/service/server/userCreateSS';
import { userUpdateSS } from '../common/user/service/server/userUpdateSS';
import { usernameCheckSS } from '../common/user/service/server/usernameCheckSS';
import { normalizeUsername } from '@/lib/username';
import { User } from '../common/user/model/User';
import { subscriptionGetByUserIdSS } from '../common/subscription/service/server/subscriptionGetByUserIdSS';
import { isPremiumUser, isWelcomePremiumActive } from '@/lib/premium';
import { welcomePremiumClaimSS } from '../common/subscription/service/server/welcomePremiumClaimSS';
import { captureTimezone } from '@/lib/activityClient';
import posthog from 'posthog-js';
import { track } from '@/lib/analytics';
import { consumeGoogleLoginPending, trackLoginSuccess } from '@/app/auth/lib/loginTelemetry';

/**
 * The welcome week's notice until WelcomePremiumNotice has shown it: kept
 * across page loads, since signing in can end on a hard navigation.
 */
export const WELCOME_GRANT_KEY = 'welcomeGrant';

const LoggedUserContext = createContext<LoggedUserContextType>({
  user: null,
  loading: false,
  isPremium: false,
  subscriptionStatus: null,
  welcomeGrant: null,
  setState: () => { },
  reload: () => { },
});

interface LoggedUserProviderProps {
  children: ReactNode;
}

export const LoggedUserProvider: React.FC<LoggedUserProviderProps> = ({ children }) => {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const [state, setState] = useState<LoggedUserState>({
    user: null,
    loading: true,
    isPremium: false,
    subscriptionStatus: null,
    welcomeGrant: null,
  });
  const syncInProgress = useRef(false);

  const reload = useCallback(async () => {
    if (clerkUser) {
      setState(prev => ({ ...prev, loading: true }));
      try {
        const { user: dbUser } = await fetchOrCreateUser(clerkUser.id, clerkUser);
        const { isPremium, subscriptionStatus } = await fetchSubscriptionStatus(dbUser);
        setState(prev => ({ ...prev, user: dbUser, loading: false, isPremium, subscriptionStatus }));
        localStorage.setItem('user', JSON.stringify(dbUser));
        localStorage.setItem('subscription', JSON.stringify({ isPremium, subscriptionStatus }));
      } catch (error) {
        console.error("Error reloading user:", error);
        setState(prev => ({ ...prev, loading: false }));
      }
    }
  }, [clerkUser]);

  useEffect(() => {
    // Load cached user initially
    const cachedUser = localStorage.getItem('user');
    const cachedSubscription = localStorage.getItem('subscription');
    if (cachedUser) {
      try {
        const parsedUser = JSON.parse(cachedUser);
        const parsedSubscription = cachedSubscription ? JSON.parse(cachedSubscription) : { isPremium: false, subscriptionStatus: null };
        const cachedGrant = localStorage.getItem(WELCOME_GRANT_KEY);
        setState(prev => ({
          ...prev,
          // Not told yet: the sign-in that granted it hard-navigated before the notice ran.
          welcomeGrant: prev.welcomeGrant ?? (cachedGrant ? JSON.parse(cachedGrant) : null),
          user: parsedUser,
          loading: !isClerkLoaded,
          isPremium: parsedSubscription.isPremium || false,
          subscriptionStatus: parsedSubscription.subscriptionStatus || null,
        }));
      } catch (error) {
        console.error("Error parsing cached user:", error);
        localStorage.removeItem('user');
        localStorage.removeItem('subscription');
        localStorage.removeItem(WELCOME_GRANT_KEY);
      }
    }
  }, [isClerkLoaded]);

  useEffect(() => {
    if (!isClerkLoaded) return;

    const syncUser = async () => {
      if (isSignedIn && clerkUser?.id) {
        if (syncInProgress.current) return;
        syncInProgress.current = true;
        setState(prev => ({ ...prev, loading: true }));
        try {
          const { user: foundUser, created } = await fetchOrCreateUser(clerkUser.id, clerkUser);
          const { user: dbUser, welcomeGrant: newGrant } = await claimWelcomePremium(foundUser);
          const { isPremium, subscriptionStatus } = await fetchSubscriptionStatus(dbUser);
          if (newGrant) localStorage.setItem(WELCOME_GRANT_KEY, JSON.stringify(newGrant));
          setState(prev => ({ user: dbUser, loading: false, isPremium, subscriptionStatus, welcomeGrant: newGrant ?? prev.welcomeGrant }));
          localStorage.setItem('user', JSON.stringify(dbUser));
          localStorage.setItem('subscription', JSON.stringify({ isPremium, subscriptionStatus }));
          posthog.identify(dbUser.id, { email: dbUser.email, name: dbUser.name });
          // After identify, so these land on the person rather than the anonymous id.
          const googleRoundTrip = consumeGoogleLoginPending();
          if (created) {
            const viaGoogle = clerkUser.externalAccounts?.some((account) => account.provider.includes('google'));
            track('signed_up', { method: viaGoogle ? 'google' : 'password' });
          } else if (googleRoundTrip) {
            trackLoginSuccess('google');
          }
          // Needed by the daily email cron to resolve this user's local day.
          void captureTimezone();
        } catch (error) {
          console.error("Error syncing user:", error);
          setState({ user: null, loading: false, isPremium: false, subscriptionStatus: null, welcomeGrant: null });
        } finally {
          syncInProgress.current = false;
        }
      } else {
        setState({ user: null, loading: false, isPremium: false, subscriptionStatus: null, welcomeGrant: null });
        localStorage.removeItem('user');
        localStorage.removeItem('subscription');
        localStorage.removeItem(WELCOME_GRANT_KEY);
        posthog.reset();
      }
    };

    syncUser();
  }, [isClerkLoaded, isSignedIn, clerkUser?.id]);

  return (
    <LoggedUserContext.Provider value={{ ...state, setState, reload }}>
      {children}
    </LoggedUserContext.Provider>
  );
}

export const useLoggedUserContext = (): LoggedUserContextType => useContext(LoggedUserContext);

interface ClerkUserData {
  id: string;
  primaryEmailAddress?: { emailAddress: string } | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
}

// Takes the whole user, not just the id: premium can also come from the
// lifetime comp flag, which lives on the user row rather than a subscription.
async function fetchSubscriptionStatus(
  user: User
): Promise<{ isPremium: boolean; subscriptionStatus: string | null }> {
  try {
    const subscription = await subscriptionGetByUserIdSS(user.id);
    const status = subscription?.status ?? null;
    return {
      isPremium: isPremiumUser({ status, lifetimePremium: user.lifetimePremium, welcomePremiumEndsAt: user.welcomePremiumEndsAt }),
      subscriptionStatus: status,
    };
  } catch (error) {
    console.error("Error fetching subscription:", error);
    // A lookup failure must not strip access from a lifetime or welcome-week
    // user — that signal is on the user row we already have, not on the
    // subscription we failed to read.
    return {
      isPremium: user.lifetimePremium === true || isWelcomePremiumActive(user.welcomePremiumEndsAt),
      subscriptionStatus: null,
    };
  }
}

/**
 * Starts the welcome week on the sign-in that is eligible for it (the server
 * decides; see welcomePremiumClaimSS). Skipped without a request once the row
 * shows the week was already granted or the reader is lifetime. A failure
 * never blocks signing in: the next sign-in tries again.
 */
async function claimWelcomePremium(user: User): Promise<{ user: User; welcomeGrant: WelcomeGrant | null }> {
  if (user.welcomePremiumEndsAt != null || user.lifetimePremium) return { user, welcomeGrant: null };
  try {
    const claim = await welcomePremiumClaimSS();
    if (!claim.granted) return { user, welcomeGrant: null };
    track('welcome_premium_started', { firstSteps: claim.firstSteps });
    return { user: claim.user, welcomeGrant: { firstSteps: claim.firstSteps } };
  } catch (error) {
    console.error("Error claiming the welcome premium week:", error);
    return { user, welcomeGrant: null };
  }
}

/**
 * user.username is NOT NULL UNIQUE, so a collision here does not degrade the
 * handle — it aborts the insert and leaves the person with no row at all. Walk
 * a few suffixes until one is free rather than betting on the first guess.
 */
async function pickAvailableUsername(base: string): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    try {
      const { available } = await usernameCheckSS(candidate);
      if (available) return candidate;
    } catch {
      // Lookup failed — let the insert be the judge instead of spinning here.
      return candidate;
    }
  }
  return `${base}-${Date.now().toString(36)}`;
}

/** `created` is true only when this call inserted the user row: their first sign-in ever. */
async function fetchOrCreateUser(clerkUserId: string, clerkUser: ClerkUserData): Promise<{ user: User; created: boolean }> {
  // First, try to find user by authId
  try {
    const existingUser = await userGetByAuthIdSS(clerkUserId);
    return { user: existingUser, created: false };
  } catch {
    // User not found by authId, try by email
  }

  const email = clerkUser.primaryEmailAddress?.emailAddress || '';
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || 'User';
  // Since sign-up collects a handle, clerkUser.username is normally set and this
  // is a straight copy. The fallbacks only cover accounts created before that.
  const username = await pickAvailableUsername(
    normalizeUsername(clerkUser.username || email.split('@')[0]) || `user-${clerkUserId.slice(-8).toLowerCase()}`
  );

  // Check if user exists by email (might have different authId)
  if (email) {
    const userByEmail = await userGetByEmailSS(email);
    if (userByEmail) {
      // User exists with this email, update their authId to link with Clerk
      const updatedUser = { ...userByEmail, authId: clerkUserId };
      await userUpdateSS(updatedUser);
      return { user: updatedUser, created: false };
    }
  }

  // User doesn't exist at all, create a new one
  const newUser = await userCreateSS({
    name,
    username,
    email,
    authId: clerkUserId,
    isEmailVerified: true, // Clerk handles email verification
  });

  return { user: newUser, created: true };
}
