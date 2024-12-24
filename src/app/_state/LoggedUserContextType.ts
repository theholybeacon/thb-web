import { Dispatch, SetStateAction } from 'react';
import { User } from '../_common/user/model/User';

export interface LoggedUserState {
    user: User | null;
    loading: boolean;
}

export interface LoggedUserContextType extends LoggedUserState {
    setState: Dispatch<SetStateAction<LoggedUserState>>;
    reload: Function;
}

