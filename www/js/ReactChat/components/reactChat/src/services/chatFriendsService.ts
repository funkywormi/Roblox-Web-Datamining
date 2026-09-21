import environmentUrls from "@rbx/environment-urls";
import chatHttpTransport from "./chatHttpTransport";

// Only the id is used; names come from user-profile-api-client's useUserProfiles.
export type TFriendsApiFriendRow = {
  id: number;
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

// Subset of the given users that are the current viewer's trusted connections, from the friends-api
// batch endpoint (one call, not one per user). Empty when trusted-friends is off or none are trusted.
export const fetchTrustedFriendIds = async (
  currentUserId: number,
  userIds: readonly number[],
): Promise<number[]> => {
  if (userIds.length === 0) {
    return [];
  }
  const body = await chatHttpTransport.get<{ trustedFriendsId?: number[] }>(
    {
      url: `${environmentUrls.friendsApi}/v1/user/${currentUserId}/multiget-are-trusted-friends`,
      retryable: true,
      withCredentials: true,
    },
    { userids: userIds.join(",") },
  );
  return body.trustedFriendsId ?? [];
};

/** Sever the trusted-connection relationship with a friend (contact-card "Remove" action). */
export const removeTrustedConnection = async (friendId: number): Promise<void> => {
  await chatHttpTransport.post<unknown>({
    url: `${environmentUrls.friendsApi}/v1/users/${friendId}/remove-trusted-friend`,
    retryable: true,
    withCredentials: true,
  });
};
