import { useCallback, useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { UserProfileField } from "@rbx/user-profile-api-client";
import type UserProfileDetailsByUserId from "@rbx/user-profile-api-client/dist/types/UserProfileDetailsByUserId";
import {
  useGetChildFriendsQuery,
  useLazyGetChildFriendsQuery,
} from "../../apis/parentalControlsApi";
import {
  FindFriendsTypes,
  FindFriendsUserSort,
  TFriendResponse,
} from "../../../types/friendsTypes";
import useIncrementalUserProfiles from "../../apis/hooks/useIncrementalGetUserProfiles";

const userProfileFields = [UserProfileField.Names.CombinedName, UserProfileField.Names.Username];

export type TChildFriendsList = {
  friends: TFriendResponse[];
  friendNames: UserProfileDetailsByUserId;
  isLoading: boolean;
  isError: boolean;
  hasMore: boolean;
  /** Attach to the end of the rendered list to load the next page w/ infinite scroll. */
  loadMoreRef: (node?: Element | null) => void;
};

const useChildFriendsList = ({
  userId,
  userSort,
  findFriendsType,
}: {
  userId: number;
  userSort: FindFriendsUserSort;
  findFriendsType: FindFriendsTypes;
}): TChildFriendsList => {
  const {
    data: friendData,
    isError,
    isLoading,
  } = useGetChildFriendsQuery({ userId, userSort, findFriendsType });

  const [fetchNextFriends, { isFetching: isFetchingNextPage }] = useLazyGetChildFriendsQuery();

  const friends: TFriendResponse[] = useMemo(
    () => Object.values(friendData?.PageItems ?? {}).filter(Boolean),
    [friendData],
  );

  const friendIds: number[] = useMemo(() => friends.map(friend => friend.id), [friends]);

  const { data: friendNames, loading: areNamesLoading } = useIncrementalUserProfiles(
    friendIds,
    userProfileFields,
  );

  const fetchMoreFriends = useCallback(async () => {
    if (!isLoading && friendData?.NextCursor) {
      await fetchNextFriends({
        userId,
        userSort,
        findFriendsType,
        cursor: friendData.NextCursor,
      });
    }
  }, [friendData, fetchNextFriends, isLoading, userId, userSort, findFriendsType]);

  const { ref: loadMoreRef, inView } = useInView();

  useEffect(() => {
    if (inView && friendData?.NextCursor && !isFetchingNextPage && !areNamesLoading) {
      fetchMoreFriends().catch(() => {
        // Leave the list as it is. The next scroll tries again.
      });
    }
  }, [inView, friendData, isFetchingNextPage, areNamesLoading, fetchMoreFriends]);

  return {
    friends,
    friendNames,
    isLoading,
    isError,
    hasMore: Boolean(friendData?.NextCursor),
    loadMoreRef,
  };
};

export default useChildFriendsList;
