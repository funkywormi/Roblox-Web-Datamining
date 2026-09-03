import { TGetWebProfileUIPolicyResponse } from '../types/profileHeaderTypes';

export enum ActionType {
  SET_PROFILE_DATA,
  UPDATE_FRIEND_COUNT,
  SET_FRIEND_STATUS,
  SET_NAMES,
  SET_ERROR_MESSAGE,
  UPDATE_FOLLOWERS_COUNT,
  UPDATE_FOLLOWING,
  SHOW_BLOCK_USER_MODAL,
  UPDATE_USER_BLOCK,
  SHOW_ALIAS_EDIT_MODAL,
  SHOW_ABUSE_REPORT_DIALOG
}

export type TAction =
  | {
      type: ActionType.SET_PROFILE_DATA;
      data: {
        hasVerifiedBadge: boolean;
        friendCount: number;
        followingsCount: number;
        followersCount: number;
        hasPremiumMembership: boolean;
        friendStatus: string;
        canChat: boolean;
        isFollowing: boolean;
        isFollowed: boolean;
        hasFavorites: boolean;
        isBlocked: boolean;
        canTradeWith: boolean;
        policies: TGetWebProfileUIPolicyResponse;
        mustNotLinkConnections: boolean;
        trustedConnectionStatus: string;
        canAccessTCIndicatorViaAmpStatus: boolean;
      };
    }
  | {
      type: ActionType.UPDATE_FRIEND_COUNT;
      amount: number;
    }
  | {
      type: ActionType.SET_FRIEND_STATUS;
      status: string;
    }
  | {
      type: ActionType.SET_NAMES;
      names: {
        username?: string | null;
        combinedName?: string | null;
        displayName?: string | null;
        alias?: string | null;
      };
    }
  | {
      type: ActionType.SET_ERROR_MESSAGE;
      message: string;
    }
  | {
      type: ActionType.UPDATE_FOLLOWERS_COUNT;
      amount: number;
    }
  | {
      type: ActionType.UPDATE_FOLLOWING;
      following: boolean;
    }
  | {
      type: ActionType.SHOW_BLOCK_USER_MODAL;
      show: boolean;
    }
  | {
      type: ActionType.UPDATE_USER_BLOCK;
      block: boolean;
    }
  | {
      type: ActionType.SHOW_ALIAS_EDIT_MODAL;
      show: boolean;
    }
  | {
      type: ActionType.SHOW_ABUSE_REPORT_DIALOG;
      show: boolean;
    };
