import React, { ReactChild, ReactElement, createContext, useReducer } from 'react';
import { TAction } from './action';
import profileHeaderReducer from '../reducers/profileHeaderReducer';
import { TGetWebProfileUIPolicyResponse } from '../types/profileHeaderTypes';

export type TState = {
  names: {
    username?: string | null;
    combinedName?: string | null;
    displayName?: string | null;
    alias?: string | null;
  };
  friendCount: number;
  followingsCount: number;
  followersCount: number;
  hasPremiumMembership: boolean;
  hasVerifiedBadge: boolean;
  friendStatus: string;
  canChat: boolean;
  errorMessage: string | null;
  isFollowed: boolean;
  isFollowing: boolean;
  hasFavorites: boolean;
  showUserBlockModal: boolean;
  showAliasEditModal: boolean;
  showAbuseReportDialog: boolean;
  isBlocked: boolean;
  canTradeWith: boolean;
  policies: TGetWebProfileUIPolicyResponse;
  mustNotLinkConnections: boolean;
  trustedConnectionStatus: string;
  canAccessTCIndicatorViaAmpStatus: boolean;
};

export type TProfileHeaderContext = {
  state: TState;
  dispatch: React.Dispatch<TAction>;
};

export const initialState: TState = {
  names: {
    combinedName: '',
    username: '',
    displayName: '',
    alias: ''
  },
  friendCount: 0,
  followingsCount: 0,
  followersCount: 0,
  hasPremiumMembership: false,
  hasVerifiedBadge: false,
  friendStatus: '',
  canChat: false,
  errorMessage: null,
  isFollowed: false,
  isFollowing: false,
  hasFavorites: false,
  showUserBlockModal: false,
  showAliasEditModal: false,
  showAbuseReportDialog: false,
  isBlocked: false,
  canTradeWith: false,
  policies: {
    userBlockingApiEnabled: 0
  },
  mustNotLinkConnections: true,
  trustedConnectionStatus: '',
  canAccessTCIndicatorViaAmpStatus: false
};

export const ProfileHeaderContext = createContext<TProfileHeaderContext>({
  state: initialState,
  dispatch: () => true
});

type TParentAccountCreationContextProviderProps = {
  children: ReactChild;
};

export const ProfileHeaderContextProvider = ({
  children
}: TParentAccountCreationContextProviderProps): ReactElement => {
  const [state, dispatch] = useReducer(profileHeaderReducer, initialState);

  return (
    <ProfileHeaderContext.Provider value={{ state, dispatch }}>
      {children}
    </ProfileHeaderContext.Provider>
  );
};
