'use client';
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useRef } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { LoggedUserContextType, LoggedUserState } from './LoggedUserContextType';
import { userGetByAuthIdSS } from '../common/user/service/server/userGetByAuthIdSS';
import { userGetByEmailSS } from '../common/user/service/server/userGetByEmailSS';
import { userCreateSS } from '../common/user/service/server/userCreateSS';
import { userUpdateSS } from '../common/user/service/server/userUpdateSS';
import { User } from '../common/user/model/User';
import { subscriptionGetByUserIdSS } from '../common/subscription/service/server/subscriptionGetByUserIdSS';

const LoggedUserContext = createContext<LoggedUserContextType>({
  user: null,
  loading: false,
  isPremium: false,
  subscriptionStatus: null,
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
  });
  const syncInProgress = useRef(false);

  const reload = useCallback(async () => {
    if (clerkUser) {
      setState(prev => ({ ...prev, loading: true }));
      try {
        const dbUser = await fetchOrCreateUser(clerkUser.id, clerkUser);
        const { isPremium, subscriptionStatus } = await fetchSubscriptionStatus(dbUser.id, dbUser.createdAt);
        setState({ user: dbUser, loading: false, isPremium, subscriptionStatus });
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
        setState({
          user: parsedUser,
          loading: !isClerkLoaded,
          isPremium: parsedSubscription.isPremium || false,
          subscriptionStatus: parsedSubscription.subscriptionStatus || null,
        });
      } catch (error) {
        console.error("Error parsing cached user:", error);
        localStorage.removeItem('user');
        localStorage.removeItem('subscription');
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
          const dbUser = await fetchOrCreateUser(clerkUser.id, clerkUser);
          const { isPremium, subscriptionStatus } = await fetchSubscriptionStatus(dbUser.id, dbUser.createdAt);
          setState({ user: dbUser, loading: false, isPremium, subscriptionStatus });
          localStorage.setItem('user', JSON.stringify(dbUser));
          localStorage.setItem('subscription', JSON.stringify({ isPremium, subscriptionStatus }));
        } catch (error) {
          console.error("Error syncing user:", error);
          setState({ user: null, loading: false, isPremium: false, subscriptionStatus: null });
        } finally {
          syncInProgress.current = false;
        }
      } else {
        setState({ user: null, loading: false, isPremium: false, subscriptionStatus: null });
        localStorage.removeItem('user');
        localStorage.removeItem('subscription');
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

const PREMIUM_CUTOFF = new Date('2026-02-12T00:00:00Z');

async function fetchSubscriptionStatus(
  userId: string,
  createdAt?: Date | null
): Promise<{ isPremium: boolean; subscriptionStatus: string | null }> {
  // Early adopters get lifetime premium
  if (createdAt && new Date(createdAt) < PREMIUM_CUTOFF) {
    return { isPremium: true, subscriptionStatus: 'active' };
  }

  try {
    if (createdAt && new Date(createdAt) < PREMIUM_CUTOFF) {
      return { isPremium: true, subscriptionStatus: 'early_adopter' };
    }
    const subscription = await subscriptionGetByUserIdSS(userId);
    if (subscription && subscription.status === 'active') {
      return { isPremium: true, subscriptionStatus: subscription.status };
    }
    if (subscription) {
      return { isPremium: false, subscriptionStatus: subscription.status };
    }
    return { isPremium: false, subscriptionStatus: null };
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return { isPremium: false, subscriptionStatus: null };
  }
}

async function fetchOrCreateUser(clerkUserId: string, clerkUser: ClerkUserData): Promise<User> {
  // First, try to find user by authId
  try {
    const existingUser = await userGetByAuthIdSS(clerkUserId);
    return existingUser;
  } catch {
    // User not found by authId, try by email
  }

  const email = clerkUser.primaryEmailAddress?.emailAddress || '';
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || 'User';
  const username = clerkUser.username || email.split('@')[0] || `user_${Date.now()}`;

  // Check if user exists by email (might have different authId)
  if (email) {
    const userByEmail = await userGetByEmailSS(email);
    if (userByEmail) {
      // User exists with this email, update their authId to link with Clerk
      const updatedUser = { ...userByEmail, authId: clerkUserId };
      await userUpdateSS(updatedUser);
      return updatedUser;
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

  return newUser;
}
