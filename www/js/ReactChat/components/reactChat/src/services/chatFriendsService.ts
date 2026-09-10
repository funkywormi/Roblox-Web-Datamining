import environmentUrls from "@rbx/environment-urls";
import chatHttpTransport from "./chatHttpTransport";

// Only the id is used; names come from fetchUserNames.
export type TFriendsApiFriendRow = {
  id: number;
};

export type TUserProfileNames = {
  combinedName?: string;
  username?: string;
};

type TFriendsApiPage = {
  data: TFriendsApiFriendRow[];
  nextPageCursor?: string;
};

export const fetchFriendsPage = async (userId: number, limit = 200): Promise<TFriendsApiPage> => {
  const body = await chatHttpTransport.get<{
    data?: TFriendsApiFriendRow[];
    nextPageCursor?: string;
  }>(
    {
      url: `${environmentUrls.friendsApi}/v1/users/${userId}/friends`,
      withCredentials: true,
    },
    { limit },
  );
  return { data: body.data ?? [], nextPageCursor: body.nextPageCursor };
};

// Friend display names via user-profile-api get-profiles (combinedName), matching AngularJS.
export const fetchUserNames = async (
  userIds: number[],
): Promise<Record<number, TUserProfileNames>> => {
  const deduped = [...new Set(userIds)];
  if (deduped.length === 0) {
    return {};
  }

  const body = await chatHttpTransport.post<{
    profileDetails?: { userId: number; names?: TUserProfileNames }[];
  }>(
    {
      url: `${environmentUrls.apiGatewayUrl}/user-profile-api/v1/user/profiles/get-profiles`,
      retryable: true,
      withCredentials: true,
    },
    { userIds: deduped, fields: ["names.combinedName", "names.username"] },
  );

  const namesByUserId: Record<number, TUserProfileNames> = {};
  for (const row of body.profileDetails ?? []) {
    namesByUserId[row.userId] = row.names ?? {};
  }
  return namesByUserId;
};

/** Sever the trusted-connection relationship with a friend (contact-card "Remove" action). */
export const removeTrustedConnection = async (friendId: number): Promise<void> => {
  await chatHttpTransport.post<unknown>({
    url: `${environmentUrls.friendsApi}/v1/users/${friendId}/remove-trusted-friend`,
    retryable: true,
    withCredentials: true,
  });
};
