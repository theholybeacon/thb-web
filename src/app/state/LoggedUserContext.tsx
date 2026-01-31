'use client';
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { LoggedUserContextType, LoggedUserState } from './LoggedUserContextType';
import { userGetByAuthIdSS } from '../common/user/service/server/userGetByAuthIdSS';
import { userGetByEmailSS } from '../common/user/service/server/userGetByEmailSS';
import { userCreateSS } from '../common/user/service/server/userCreateSS';
import { userUpdateSS } from '../common/user/service/server/userUpdateSS';
import { User } from '../common/user/model/User';

const LoggedUserContext = createContext<LoggedUserContextType>({
  user: null,
  loading: false,
  setState: () => { },
  reload: () => { },
});

interface LoggedUserProviderProps {
  children: ReactNode;
}

export const LoggedUserProvider: React.FC<LoggedUserProviderProps> = ({ children }) => {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const [state, setState] = useState<LoggedUserState>({ user: null, loading: true });

  const reload = useCallback(async () => {
    if (clerkUser) {
      setState(prev => ({ ...prev, loading: true }));
      try {
        const dbUser = await fetchOrCreateUser(clerkUser.id, clerkUser);
        setState({ user: dbUser, loading: false });
        localStorage.setItem('user', JSON.stringify(dbUser));
      } catch (error) {
        console.error("Error reloading user:", error);
        setState(prev => ({ ...prev, loading: false }));
      }
    }
  }, [clerkUser]);

  useEffect(() => {
    // Load cached user initially
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        const parsedUser = JSON.parse(cachedUser);
        setState({ user: parsedUser, loading: !isClerkLoaded });
      } catch (error) {
        console.error("Error parsing cached user:", error);
        localStorage.removeItem('user');
      }
    }
  }, [isClerkLoaded]);

  useEffect(() => {
    if (!isClerkLoaded) return;

    const syncUser = async () => {
      if (isSignedIn && clerkUser) {
        setState(prev => ({ ...prev, loading: true }));
        try {
          const dbUser = await fetchOrCreateUser(clerkUser.id, clerkUser);
          setState({ user: dbUser, loading: false });
          localStorage.setItem('user', JSON.stringify(dbUser));
        } catch (error) {
          console.error("Error syncing user:", error);
          setState({ user: null, loading: false });
        }
      } else {
        setState({ user: null, loading: false });
        localStorage.removeItem('user');
      }
    };

    syncUser();
  }, [isClerkLoaded, isSignedIn, clerkUser]);

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
