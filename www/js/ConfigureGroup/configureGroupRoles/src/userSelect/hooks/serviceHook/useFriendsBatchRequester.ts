import { useCallback } from 'react';
import type { QueueItem } from '@rbx/core';
import { BatchRequestFactory } from '@rbx/core';
import friendsApiClient from '../../../clients/friends';
import useCurrentGroup from '../../../hooks/useCurrentGroup';

interface BatchRequester {
  queueItem: (item: number) => Promise<boolean>;
  invalidateItem: (item: number) => void;
}

const idSerializer = (id?: number): string => {
  return id?.toString() ?? '';
};

const batchRequestProperties = {
  processBatchWaitTime: 0,
  maxRetryAttempts: 1,
  batchSize: 100,
  maxConcurrentBatches: 10,
  getFailureCooldown: () => 300,
};

const batchRequesterCache = new Map<number, BatchRequester>();

const friendsBatchRequestFactory = new BatchRequestFactory<boolean>();

const useFriendsBatchRequester = () => {
  const { user } = useCurrentGroup();
  let batchRequester: BatchRequester | undefined;

  const isUserFriend = useCallback(
    (friendId: number): Promise<boolean> => {
      return batchRequester?.queueItem(friendId) ?? Promise.resolve(false);
    },
    [batchRequester],
  );

  if (user?.id) {
    if (!batchRequesterCache.has(user.id)) {
      const batchProcessor = async (ids: QueueItem<number>[]) => {
        const friends = await friendsApiClient.getWhichUsersAreFriendsOfUser(
          user.id,
          ids.map((item) => item.itemId),
        );
        const allFriends = new Set(friends?.friendsId);
        const result: Record<string, boolean> = {};
        ids.forEach((item) => {
          result[item.key] = allFriends.has(item.itemId);
        });
        return result;
      };

      batchRequesterCache.set(
        user.id,
        friendsBatchRequestFactory.createRequestProcessor(
          batchProcessor,
          idSerializer,
          batchRequestProperties,
        ),
      );
    }
    batchRequester = batchRequesterCache.get(user.id);
  }
  return isUserFriend;
};

export default useFriendsBatchRequester;
