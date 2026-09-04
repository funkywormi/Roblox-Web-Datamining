import { httpService } from "@rbx/core-scripts/legacy/core-utilities";
import { friendshipStatuses, type FriendshipStatus } from "../constants/friendshipStatus";
import { playerSearchConstants } from "../constants/playerSearchConstants";
import type { UserFollowing } from "../types/userFollowing";
import { getCurrentUser } from "./robloxGlobals";

type UserFollowingsResponse = {
  followings: UserFollowing[];
};

export type UserFriendship = {
  id: number;
  status: FriendshipStatus;
};

type UserFriendshipResult = {
  data: UserFriendship[];
};

type RequestFriendshipResponse = {
  success: boolean;
  message?: string;
};

const getFallbackFollowings = (userIds: number[]): UserFollowing[] => {
  return userIds.map(userId => ({
    userId,
    isFollowed: false,
    isFollowing: false,
  }));
};

export const multiGetUserFollowings = async (userIds: number[]): Promise<UserFollowing[]> => {
  if (userIds.length === 0) {
    return [];
  }

  if (!getCurrentUser().isAuthenticated) {
    return [];
  }

  try {
    const response = await httpService.post<UserFollowingsResponse>(
      {
        retryable: true,
        withCredentials: true,
        url: playerSearchConstants.urls.followingExistsUrl,
      },
      {
        targetUserIds: userIds,
      },
    );

    return response.data.followings;
  } catch (error) {
    console.error("playerSearch: following-exists failed, dropping the 'You are following' line", {
      userIds,
      error,
    });

    return getFallbackFollowings(userIds);
  }
};

export const multiGetFriendshipStatuses = async (userIds: number[]): Promise<UserFriendship[]> => {
  if (userIds.length === 0) {
    return [];
  }

  const currentUser = getCurrentUser();

  if (!currentUser.isAuthenticated) {
    return [];
  }

  try {
    const response = await httpService.get<UserFriendshipResult>(
      {
        retryable: true,
        withCredentials: true,
        url: `${playerSearchConstants.urls.friendshipStatusesUrl}/${currentUser.userId}/friends/statuses`,
      },
      {
        userIds: userIds.join(","),
      },
    );

    return response.data.data;
  } catch (error) {
    console.error(
      "playerSearch: friendship statuses failed, every card will offer Add Friend regardless of state",
      { userIds, error },
    );

    return userIds.map(id => ({
      id,
      status: friendshipStatuses.notFriends,
    }));
  }
};

const getFriendshipUrl = (template: string, targetId: number): string => {
  return template.replace("{targetId}", String(targetId));
};

export const requestFriendship = async (targetId: number): Promise<RequestFriendshipResponse> => {
  const response = await httpService.post<RequestFriendshipResponse>(
    {
      url: getFriendshipUrl(playerSearchConstants.urls.requestFriendshipUrl, targetId),
      withCredentials: true,
    },
    {
      friendshipOriginSourceType: playerSearchConstants.playerSearchFriendshipOriginSourceType,
    },
  );

  return response.data;
};

export const acceptFriendRequest = async (targetId: number): Promise<void> => {
  await httpService.post({
    url: getFriendshipUrl(playerSearchConstants.urls.acceptFriendRequestUrl, targetId),
    withCredentials: true,
  });
};
