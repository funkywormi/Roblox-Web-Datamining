import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-scripts/http";
import {
  TGetFriendsCountResponse,
  TGetAllOnlineFriendsResponse,
  TUserPresenceType,
  TFindFriendsResponse,
  TFindFriendsFriend,
  TGetProfilesResponse,
  TFriend,
  TPresence,
  TOnlineFriendType,
  TGetNewFriendRequestsCountResponse,
  TProfile,
} from "../types/friendsCarousel";

const getFriendsCount = async (userId: number): Promise<TGetFriendsCountResponse> => {
  const urlConfig = {
    url: `${environmentUrls.friendsApi}/v1/users/${userId}/friends/count`,
    retryable: true,
    withCredentials: true,
  };
  const { data } = await http.get<TGetFriendsCountResponse>(urlConfig);
  return data;
};

const getAllOnlineFriends = async (userId: number): Promise<TGetAllOnlineFriendsResponse> => {
  const urlConfig = {
    url: `${environmentUrls.friendsApi}/v1/users/${userId}/friends/online`,
    retryable: true,
    withCredentials: true,
  };

  const { data } = await http.get<TGetAllOnlineFriendsResponse>(urlConfig);
  return data;
};

const getPaginatedFriends = async (
  userId: number,
  isOwnUser: boolean,
): Promise<TFindFriendsResponse> => {
  const nonSortedUrl = `${environmentUrls.friendsApi}/v1/users/${userId}/friends/find`;
  const urlConfig = {
    url: isOwnUser ? `${nonSortedUrl}?userSort=1` : nonSortedUrl,
    retryable: true,
    withCredentials: true,
  };

  const { data } = await http.get<TFindFriendsResponse>(urlConfig);
  return data;
};

const getProfiles = async (userIds: number[]): Promise<TGetProfilesResponse> => {
  const urlConfig = {
    url: `${environmentUrls.apiGatewayUrl}/user-profile-api/v1/user/profiles/get-profiles`,
    retryable: true,
    withCredentials: true,
  };

  const requestData = {
    userIds,
    fields: ["names.combinedName", "isVerified", "hasRobloxSubscription"],
  };

  const { data } = await http.post<TGetProfilesResponse>(urlConfig, requestData);
  return data;
};

const getOnlineFriendsOrEmpty = async (
  userId: number,
  isOwnUser: boolean,
): Promise<TOnlineFriendType[]> => {
  if (!isOwnUser) {
    return [];
  }

  try {
    const { data } = await getAllOnlineFriends(userId);
    return data;
  } catch (error) {
    console.error("Error fetching online friends:", error);
    return [];
  }
};

const getPaginatedFriendsOrEmpty = async (
  userId: number,
  isOwnUser: boolean,
): Promise<TFindFriendsFriend[]> => {
  try {
    const { PageItems } = await getPaginatedFriends(userId, isOwnUser);
    return PageItems;
  } catch (error) {
    console.error("Error fetching friends:", error);
    return [];
  }
};

const getFriends = async (userId: number, isOwnUser: boolean): Promise<TFriend[]> => {
  const [onlineFriendsResponse, offlineFriends] = await Promise.all([
    getOnlineFriendsOrEmpty(userId, isOwnUser),
    getPaginatedFriendsOrEmpty(userId, isOwnUser),
  ]);

  onlineFriendsResponse.sort(
    (friend1: TOnlineFriendType, friend2: TOnlineFriendType): number =>
      friend2.sortScore - friend1.sortScore,
  );

  const presenceMapping = new Map<number, TUserPresenceType>();

  for (const onlineFriend of onlineFriendsResponse) {
    presenceMapping.set(onlineFriend.id, onlineFriend.userPresence);
  }

  const onlineFriendsIds: number[] = onlineFriendsResponse.map(friend => friend.id);
  const offlineFriendsIds: number[] = offlineFriends
    .filter(friend => !onlineFriendsIds.includes(friend.id))
    .map(friend => friend.id);
  const friendIds: number[] = [...onlineFriendsIds, ...offlineFriendsIds];

  if (friendIds.length === 0) {
    return [];
  }

  const friendProfiles = (await getProfiles(friendIds)).profileDetails;
  const friendProfilesMap = new Map<number, TProfile>(
    friendProfiles.map(profile => [profile.userId, profile]),
  );

  const friends: TFriend[] = [];

  friendIds.forEach(id => {
    const isOnline = presenceMapping.has(id);
    const presence: TPresence = {
      isOnline,
      isInGame: isOnline && presenceMapping.get(id)?.UserPresenceType === "InGame",
      lastLocation: isOnline ? presenceMapping.get(id)?.lastLocation : undefined,
      gameId: isOnline ? presenceMapping.get(id)?.gameInstanceId : undefined,
      universeId: isOnline ? presenceMapping.get(id)?.universeId : undefined,
      placeId: isOnline ? presenceMapping.get(id)?.placeId : undefined,
    };
    const friend = friendProfilesMap.get(id);
    friends.push({
      id,
      combinedName: friend?.names.combinedName,
      presence,
      hasVerifiedBadge: friend?.isVerified ?? false,
      isRobloxPlus: friend?.hasRobloxSubscription === true,
    });
  });

  return friends;
};

const getNewFriendRequestsCount = async (): Promise<number> => {
  const urlConfig = {
    url: `${environmentUrls.friendsApi}/v1/my/new-friend-requests/count`,
    retryable: true,
    withCredentials: true,
  };

  const { data } = await http.get<TGetNewFriendRequestsCountResponse>(urlConfig);
  return data.count;
};

export { getFriendsCount, getFriends, getNewFriendRequestsCount };
