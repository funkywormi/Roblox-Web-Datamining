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

/** Sever the trusted-connection relationship with a friend (contact-card "Remove" action). */
export const removeTrustedConnection = async (friendId: number): Promise<void> => {
  await chatHttpTransport.post<unknown>({
    url: `${environmentUrls.friendsApi}/v1/users/${friendId}/remove-trusted-friend`,
    retryable: true,
    withCredentials: true,
  });
};
