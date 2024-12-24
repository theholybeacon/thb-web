'use client';
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { auth } from '../../../firebase.config';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import nookies from 'nookies';
import { LoggedUserContextType, LoggedUserState } from './LoggedUserContextType';
import { userGetByAuthIdSS } from '../_common/user/service/server/userGetByAuthIdSS';
import { userUpdateSS } from '../_common/user/service/server/userUpdateSS';
import { User } from '../_common/user/model/User';

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
  const [state, setState] = useState<LoggedUserState>({ user: null, loading: true });

  useEffect(() => {
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      setState({ user: JSON.parse(cachedUser), loading: false });
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setState((prevState) => ({ ...prevState, loading: true }));
        const user = await initialFetch(firebaseUser);
        setState({
          user,
          loading: false,
        });

        localStorage.setItem('user', JSON.stringify(user));

        const token = await firebaseUser.getIdToken();
        nookies.set(undefined, 'token', token, { path: '/' });
      } else {
        setState({
          user: null,
          loading: false,
        });

        localStorage.removeItem('user');
        nookies.destroy(undefined, 'token');
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <LoggedUserContext.Provider value={{ ...state, setState, reload }}>
      {children}
    </LoggedUserContext.Provider>
  );
}
const reload = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  window.location.reload();
};

export const useLoggedUserContext = (): LoggedUserContextType => useContext(LoggedUserContext);

export async function initialFetch(firebaseUser: FirebaseUser): Promise<User> {
  const user = await userGetByAuthIdSS(firebaseUser.uid);

  if (!user.isEmailVerified && firebaseUser.emailVerified) {
    user.isEmailVerified = true;
    await userUpdateSS(user);
  }

  return user;
}


