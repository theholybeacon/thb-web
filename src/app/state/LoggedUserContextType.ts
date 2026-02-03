import { Dispatch, SetStateAction } from 'react';
import { User } from '../common/user/model/User';

export interface LoggedUserState {
    user: User | null;
    loading: boolean;
    isPremium: boolean;
    subscriptionStatus: string | null;
}

export interface LoggedUserContextType extends LoggedUserState {
    setState: Dispatch<SetStateAction<LoggedUserState>>;
    reload: Function;
}

