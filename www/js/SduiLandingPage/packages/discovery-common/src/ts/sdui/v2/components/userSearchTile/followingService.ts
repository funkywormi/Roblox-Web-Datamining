import { batchQuery } from "@rbx/core-lib/promise";
import * as http from "@rbx/core-scripts/http";
import environmentUrls from "@rbx/environment-urls";

type FollowingStatus = {
  userId?: number;
  isFollowing?: boolean;
};

type FollowingStatusesResponse = {
  followings?: FollowingStatus[];
};

const BATCH_DELAY_MS = 10;
const MAX_BATCH_SIZE = 50;

async function fetchFollowingStatuses(userIds: number[]): Promise<FollowingStatusesResponse> {
  return (
    await http.post<FollowingStatusesResponse>(
      {
        retryable: true,
        url: `${environmentUrls.friendsApi}/v1/user/following-exists`,
        withCredentials: true,
      },
      {
        targetUserIds: userIds,
      },
    )
  ).data;
}

export const requestFollowingStatus = batchQuery(
  { delay: BATCH_DELAY_MS, maxSize: MAX_BATCH_SIZE },
  fetchFollowingStatuses,
  (response: FollowingStatusesResponse, userId: number): boolean =>
    response.followings?.find(status => status.userId === userId)?.isFollowing === true,
);
