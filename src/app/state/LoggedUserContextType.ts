import { Dispatch, SetStateAction } from 'react';
import { User } from '../common/user/model/User';

/**
 * Set for the page load whose sign-in just started the welcome week, so the
 * app can tell the reader once. `firstSteps`: they have no study or session yet.
 */
export interface WelcomeGrant {
    firstSteps: boolean;
}

export interface LoggedUserState {
    user: User | null;
    loading: boolean;
    isPremium: boolean;
    subscriptionStatus: string | null;
    welcomeGrant: WelcomeGrant | null;
}

export interface LoggedUserContextType extends LoggedUserState {
    setState: Dispatch<SetStateAction<LoggedUserState>>;
    reload: Function;
}

