/* eslint-disable no-void */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { UserProfileField } from "@rbx/user-profile-api-client";
import { Chip } from "@rbx/foundation-ui";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import {
  useGetChildFriendsCountQuery,
  useGetChildFriendsQuery,
  useLazyGetChildFriendsQuery,
} from "../../../../apis/parentalControlsApi";
import {
  FindFriendsTypes,
  FindFriendsUserSort,
  FriendFilterType,
} from "../../../../../types/friendsTypes";
import FriendListItem from "./FriendListItem";
import InformationalScreen from "../../../../common/components/InformationalScreen";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import StackedUserInput from "../../../../common/components/StackedUserInput";
import { useWrappedTranslation } from "../../../hooks/useWrappedTranslation";
import useIncrementalUserProfiles from "../../../../apis/hooks/useIncrementalGetUserProfiles";
import { trustedConnectionsHelpPageUrl } from "../../../constants/urlConstants";
import {
  AddTrustedConnectionFeatureSet,
  getAddTrustedConnectionFeatureSet,
} from "../../../utils/trustedFriendsAvailableFeaturesUtils";

const FriendManagementSection = ({
  child,
  showChips = false,
}: {
  child: TChildInfo;
  showChips?: boolean;
}): JSX.Element => {
  const [userSelectedFilter, setUserSelectedFilter] = useState<FriendFilterType>(
    FriendFilterType.All,
  );
  const activeFilter = showChips ? userSelectedFilter : FriendFilterType.All;

  const userSort: FindFriendsUserSort =
    activeFilter === FriendFilterType.Trusted
      ? FindFriendsUserSort.Created
      : FindFriendsUserSort.FriendScore;

  const findFriendsType: FindFriendsTypes =
    activeFilter === FriendFilterType.Trusted
      ? FindFriendsTypes.TrustedFriends
      : FindFriendsTypes.Friends;

  const { translate } = useWrappedTranslation();

  const { data: countData } = useGetChildFriendsCountQuery(child.userId);

  const chipFilters = useMemo(() => {
    const displayCount = countData?.count ?? "";

    return [
      {
        key: FriendFilterType.All,
        text: translate(parentalControlsTranslationConstants.friendManagement.chips.allWithCount, {
          count: displayCount,
        }),
      },
      {
        key: FriendFilterType.Trusted,
        text: translate(parentalControlsTranslationConstants.friendManagement.chips.trusted),
      },
    ];
  }, [translate, countData]);

  const {
    data: friendData,
    isError,
    isLoading,
  } = useGetChildFriendsQuery({
    userId: child.userId,
    userSort,
    findFriendsType,
  });

  // FindFriends does not return info about which friends are trusted,
  // so we need to fetch all pages of trusted friends so we can mark which friends are trusted when viewing "All"
  const [fetchTrustedFriends] = useLazyGetChildFriendsQuery();
  const [trustedFriendIds, setTrustedFriendIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Recursively retrieve all pages of trusted friends
    const fetchPage = (cursor?: string): Promise<number[]> =>
      fetchTrustedFriends(
        {
          userId: child.userId,
          userSort: FindFriendsUserSort.Created,
          findFriendsType: FindFriendsTypes.TrustedFriends,
          ...(cursor ? { cursor } : {}),
        },
        !cursor,
      )
        .unwrap()
        .then(result => {
          const ids = result.PageItems.map(f => f.id);
          if (result.NextCursor) {
            return fetchPage(result.NextCursor).then(nextIds => [...ids, ...nextIds]);
          }
          return ids;
        });

    const fetchAllTrustedFriends = async () => {
      const allIds = await fetchPage();
      setTrustedFriendIds(new Set(allIds));
    };

    void fetchAllTrustedFriends();
  }, [child.userId, fetchTrustedFriends]);

  const [fetchNextChildFriends, { isFetching: isFetchingNextPage }] = useLazyGetChildFriendsQuery();

  const friendIds: number[] = useMemo(
    () => Object.values(friendData?.PageItems || {}).map(friend => friend.id),
    [friendData],
  );

  const userProfileFields = [UserProfileField.Names.CombinedName, UserProfileField.Names.Username];
  const { data: friendNames, loading: userProfilesLoading } = useIncrementalUserProfiles(
    friendIds,
    userProfileFields,
  );

  const fetchMoreFriends = useCallback(async () => {
    if (!isLoading && friendData?.NextCursor) {
      await fetchNextChildFriends({
        userId: child.userId,
        userSort,
        cursor: friendData?.NextCursor,
        findFriendsType,
      });
    }
  }, [friendData, fetchNextChildFriends, isLoading, child.userId, userSort, findFriendsType]);

  const { ref, inView } = useInView(); // This hook fires when the object comes into view.

  useEffect(() => {
    // We add ref to the bottom of the list, so we know to paginate the list if ref is in view (and the current list is loaded).
    if (inView && friendData?.NextCursor && !isFetchingNextPage && !userProfilesLoading) {
      void fetchMoreFriends();
    }
  }, [inView, friendData, isFetchingNextPage, userProfilesLoading, fetchMoreFriends]);

  const getFriendItems = (): JSX.Element | undefined => {
    const listItems: JSX.Element[] = [];
    Object.values(friendData?.PageItems || {}).forEach(friend => {
      if (!friend) return;

      const displayName = friendNames?.[friend.id]?.names?.combinedName ?? "";
      const userName = friendNames?.[friend.id]?.names?.username ?? "";
      listItems.push(
        <FriendListItem
          key={friend.id}
          child={child}
          friend={friend}
          displayName={displayName}
          userName={userName}
          isTrusted={trustedFriendIds.has(friend.id)}
        />,
      );
    });
    return <React.Fragment>{listItems}</React.Fragment>;
  };

  const getChips = (): JSX.Element | null => {
    if (!showChips) {
      return null;
    }

    return (
      <div className="chip-container">
        {chipFilters.map(({ key, text }) => (
          <Chip
            key={key}
            text={text}
            isChecked={activeFilter === key}
            onCheckedChange={() => setUserSelectedFilter(key)}
          />
        ))}
      </div>
    );
  };

  const getDisclaimerTranslationKey = (): string => {
    switch (getAddTrustedConnectionFeatureSet(child.trustedFriendsAvailableFeatures)) {
      case AddTrustedConnectionFeatureSet.ChatAcrossAgeGroups:
        return parentalControlsTranslationConstants.friendManagement.trustedFriendDisclaimers
          .chatAcrossAgeGroups;
      case AddTrustedConnectionFeatureSet.ChatAcrossAgeGroupsAndChatWithoutFilter:
        return parentalControlsTranslationConstants.friendManagement.trustedFriendDisclaimers
          .chatAcrossAgeGroupsAndChatWithoutFilter;
      case AddTrustedConnectionFeatureSet.Default:
      default:
        return parentalControlsTranslationConstants.friendManagement.trustedFriendDisclaimers.v1;
    }
  };

  const getDisclaimer = (): JSX.Element | null => {
    if (!child.shouldShowTrustedFriendsDisclaimer) {
      return null;
    }

    return (
      <div
        className="text-body-medium"
        dangerouslySetInnerHTML={{
          __html: translate(getDisclaimerTranslationKey(), {
            linkStart: `<br /><a class="text-link" target="_blank" rel="noreferrer" href="${trustedConnectionsHelpPageUrl}">`,
            linkEnd: "</a>",
          }),
        }}
      />
    );
  };

  const getSectionContent = (): JSX.Element | null => {
    // 1. Handle loading state
    if (isLoading) {
      return null;
    }

    // 2. Handle error state now that we know the request is complete
    if (isError) {
      return (
        <div className="friend-management-section">
          <InformationalScreen
            descriptionTranslationKey={parentalControlsTranslationConstants.errorLoadingList}
          />
        </div>
      );
    }

    // 3. Handle the empty/zero-data state
    if (!friendData?.PageItems || Object.keys(friendData.PageItems).length === 0) {
      const zeroStateKey: string =
        activeFilter === FriendFilterType.Trusted
          ? parentalControlsTranslationConstants.friendManagement.noTrustedConnections
          : parentalControlsTranslationConstants.friendManagement.carousel.noFriends;

      return (
        <div className="friend-management-section">
          <InformationalScreen descriptionTranslationKey={zeroStateKey} />
        </div>
      );
    }

    // Default/success state: render the list of friends
    return (
      <div className="friend-management-section">
        <StackedUserInput inputId="show-friend-list">
          <div className="friend-list">
            {getFriendItems()}
            {friendData?.NextCursor && <div ref={ref} />}
          </div>
        </StackedUserInput>
      </div>
    );
  };

  return (
    <div className="friend-list-container">
      {getDisclaimer()}
      {getChips()}
      {getSectionContent()}
    </div>
  );
};

export default FriendManagementSection;
