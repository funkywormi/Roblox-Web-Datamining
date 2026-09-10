import environmentUrls from "@rbx/environment-urls";
import chatHttpTransport from "./chatHttpTransport";

export type TFriendsApiFriendRow = {
  id: number;
  name?: string;
  displayName?: string;
  hasVerifiedBadge?: boolean;
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

const USERS_BATCH_SIZE = 100;

export const fetchUserDetails = async (userIds: number[]): Promise<TFriendsApiFriendRow[]> => {
  if (userIds.length === 0) {
    return [];
  }

  const batches: number[][] = [];
  for (let i = 0; i < userIds.length; i += USERS_BATCH_SIZE) {
    batches.push(userIds.slice(i, i + USERS_BATCH_SIZE));
  }

  const results = await Promise.all(
    batches.map(async batch => {
      const body = await chatHttpTransport.post<{ data?: TFriendsApiFriendRow[] }>(
        {
          url: `${environmentUrls.usersApi}/v1/users`,
          withCredentials: true,
        },
        { userIds: batch },
      );
      return body.data ?? [];
    }),
  );

  return results.flat();
};
