'use client';
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import nookies from 'nookies';
import { LoggedUserContextType, LoggedUserState } from './LoggedUserContextType';
import { userGetByAuthIdSS } from '../common/user/service/server/userGetByAuthIdSS';
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

const reload = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  window.location.reload();
};

export const LoggedUserProvider: React.FC<LoggedUserProviderProps> = ({ children }) => {
  const [state, setState] = useState<LoggedUserState>({ user: null, loading: false });

  useEffect(() => {
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        const parsedUser = JSON.parse(cachedUser);
        setState({ user: parsedUser, loading: false });
      } catch (error) {
        console.error("Error parsing cached user:", error);
        localStorage.removeItem('user');
      }
    }


    return () => {
    };
  }, []);

  return (
    <LoggedUserContext.Provider value={{ ...state, setState, reload }}>
      {children}
    </LoggedUserContext.Provider>
  );
}

export const useLoggedUserContext = (): LoggedUserContextType => useContext(LoggedUserContext);

export async function initialFetch(firebaseUser: FirebaseUser): Promise<User> {
  try {
    const user = await userGetByAuthIdSS(firebaseUser.uid);

    if (!user.isEmailVerified && firebaseUser.emailVerified) {
      user.isEmailVerified = true;
      await userUpdateSS(user);
    }

    return user;
  } catch (error) {
    console.error("Error in initialFetch:", error);
    throw error; // Ensure the error propagates to be caught in useEffect
  }
}
