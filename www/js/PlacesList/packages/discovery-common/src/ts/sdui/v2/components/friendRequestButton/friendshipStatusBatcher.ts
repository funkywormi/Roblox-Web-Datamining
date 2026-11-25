import { batchQuery } from "@rbx/core-lib/promise";
import { fetchFriendshipStatuses } from "./friendshipService";
import type { FriendshipStatus } from "./friendshipStatus";

type FriendshipStatusRequest = {
  targetUserId: string;
  viewerUserId: string;
};

function friendshipStatusRequestKey({
  targetUserId,
  viewerUserId,
}: FriendshipStatusRequest): string {
  return `${viewerUserId}:${targetUserId}`;
}

const resolveFriendshipStatus = batchQuery<
  FriendshipStatusRequest,
  Map<string, FriendshipStatus>,
  FriendshipStatus
>(
  { delay: 0, maxSize: 100 },
  async requests => {
    const targetUserIdsByViewerUserId = new Map<string, string[]>();
    for (const { targetUserId, viewerUserId } of requests) {
      const targetUserIds = targetUserIdsByViewerUserId.get(viewerUserId) ?? [];
      targetUserIds.push(targetUserId);
      targetUserIdsByViewerUserId.set(viewerUserId, targetUserIds);
    }

    const statusMapsByViewerUserId = await Promise.all(
      Array.from(targetUserIdsByViewerUserId, async ([viewerUserId, targetUserIds]) => {
        const friendshipStatusByTargetUserId = await fetchFriendshipStatuses(
          viewerUserId,
          targetUserIds,
        );
        return [viewerUserId, friendshipStatusByTargetUserId] as const;
      }),
    );

    const friendshipStatusByRequestKey = new Map<string, FriendshipStatus>();
    for (const [viewerUserId, friendshipStatusByTargetUserId] of statusMapsByViewerUserId) {
      friendshipStatusByTargetUserId.forEach((friendshipStatus, targetUserId) => {
        friendshipStatusByRequestKey.set(
          friendshipStatusRequestKey({ targetUserId, viewerUserId }),
          friendshipStatus,
        );
      });
    }
    return friendshipStatusByRequestKey;
  },
  (friendshipStatusByRequestKey, request) => {
    const friendshipStatus = friendshipStatusByRequestKey.get(friendshipStatusRequestKey(request));
    if (friendshipStatus == null) {
      throw new Error(`Friendship status response omitted user ${request.targetUserId}`);
    }
    return friendshipStatus;
  },
);

export function requestFriendshipStatus(
  viewerUserId: string,
  targetUserId: string,
): Promise<FriendshipStatus> {
  return resolveFriendshipStatus({ targetUserId, viewerUserId });
}
