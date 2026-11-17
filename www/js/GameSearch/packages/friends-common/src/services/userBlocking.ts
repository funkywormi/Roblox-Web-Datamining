import { batchQuery } from "@rbx/core-lib/promise";
import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-scripts/http";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";

const { apiGatewayUrl } = environmentUrls;

const blockUser = async (profileId: number): Promise<void> => {
  await http.post({
    url: `${apiGatewayUrl}/user-blocking-api/v1/users/${profileId}/block-user`,
    withCredentials: true,
  });
};

const unblockUser = async (profileId: number): Promise<void> => {
  await http.post({
    url: `${apiGatewayUrl}/user-blocking-api/v1/users/${profileId}/unblock-user`,
    withCredentials: true,
  });
};

const isBlockedUser = async (profileId: number): Promise<boolean> => {
  const { data } = await http.get<boolean>({
    url: `${apiGatewayUrl}/user-blocking-api/v1/users/${profileId}/is-blocked`,
    withCredentials: true,
  });
  return data;
};

type BatchReciprocalBlockResponse = {
  users: { isBlocked: boolean; isBlockingViewer: boolean; userId: number }[];
};

const batchCheckReciprocalBlock = async (
  userIds: number[],
): Promise<BatchReciprocalBlockResponse> => {
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- keep the legacy reader until that bundle can absorb it
  const requesterId = authenticatedUser()?.id;
  if (requesterId == null) {
    return {
      users: [
        {
          isBlocked: false,
          isBlockingViewer: false,
          userId: 0,
        },
      ],
    };
  }
  const { data } = await http.post<BatchReciprocalBlockResponse>(
    {
      url: `${apiGatewayUrl}/user-blocking-api/v1/users/batch-check-reciprocal-block`,
      withCredentials: true,
    },
    {
      userIds,
      requesterId,
    },
  );
  return data;
};

const requestIsUserBlocked = batchQuery(
  { delay: 10, maxSize: 50 },
  batchCheckReciprocalBlock,
  (response: BatchReciprocalBlockResponse, userId: number): boolean =>
    response.users.find(user => user.userId === userId)?.isBlocked === true,
);

export { blockUser, unblockUser, isBlockedUser, batchCheckReciprocalBlock, requestIsUserBlocked };
