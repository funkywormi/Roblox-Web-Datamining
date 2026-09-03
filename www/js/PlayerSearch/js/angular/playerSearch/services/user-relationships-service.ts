import { CurrentUser, EnvironmentUrls } from 'Roblox';
import { httpService } from 'core-utilities';
import { FriendshipStatus } from '../constants/friendship-status';
import { UserFollowing } from '../types/user-following';

// The result from the following-exists endpoint.
type UserFollowingsResponse = {
  followings: UserFollowing[];
};

// A user friendship status check result.
type UserFriendship = {
  // The related user ID.
  id: number;

  // The current friendship status.
  status: FriendshipStatus;
};

// The result of checking multiple friendship statuses.
type UserFriendshipResult = {
  // The user friendship statuses.
  data: UserFriendship[];
};

// Fetches the followings statuses for the given user IDs, based on the authenticated user.
const multiGetUserFollowings = async (userIds: number[]): Promise<UserFollowing[]> => {
  if (userIds.length < 1) {
    // If there's nothing to fetch, do nothing.
    return [];
  }

  if (!CurrentUser.isAuthenticated) {
    // If you're not logged in, you can't be following anyone.
    return [];
  }

  try {
    const response = await httpService.post<UserFollowingsResponse>(
      {
        retryable: true,
        withCredentials: true,
        url: `${EnvironmentUrls.friendsApi}/v1/user/following-exists`
      },
      {
        targetUserIds: userIds
      }
    );

    return response.data.followings;
  } catch {
    // If followings fail to load, assume no one is following anyone.
    // This to make sure player search page doesn't fail to load, on non-critical information.
    return userIds.map(userId => {
      const fakeFollowing: UserFollowing = {
        userId,
        isFollowed: false,
        isFollowing: false
      };

      return fakeFollowing;
    });
  }
};

// Fetches the friendship status of the provided users against the authenticated user.
const multiGetFriendshipStatuses = async (userIds: number[]): Promise<UserFriendship[]> => {
  if (userIds.length < 1) {
    // If there's nothing to fetch, do nothing.
    return [];
  }

  if (!CurrentUser.isAuthenticated) {
    // If you're not logged in, you can't be friends.
    return [];
  }

  try {
    const response = await httpService.get<UserFriendshipResult>(
      {
        retryable: true,
        withCredentials: true,
        url: `${EnvironmentUrls.friendsApi}/v1/users/${CurrentUser.userId}/friends/statuses`
      },
      {
        userIds: userIds.join(',')
      }
    );

    return response.data.data;
  } catch {
    // If we fail, don't crash the page.
    return [];
  }
};

export default { multiGetUserFollowings, multiGetFriendshipStatuses };
