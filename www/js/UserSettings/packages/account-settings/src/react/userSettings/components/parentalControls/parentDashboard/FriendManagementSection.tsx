/* eslint-disable no-void */
import React, { useEffect, useMemo, useState } from "react";
import { Chip } from "@rbx/foundation-ui";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import {
  useGetChildFriendsCountQuery,
  useLazyGetChildFriendsQuery,
} from "../../../../apis/parentalControlsApi";
import {
  FindFriendsTypes,
  FindFriendsUserSort,
  FriendFilterType,
} from "../../../../../types/friendsTypes";
import FriendListItem from "./FriendListItem";
import FriendsListSection from "../shared/FriendsListSection";
import useChildFriendsList from "../../../hooks/useChildFriendsList";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import { useWrappedTranslation } from "../../../hooks/useWrappedTranslation";
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

  const list = useChildFriendsList({ userId: child.userId, userSort, findFriendsType });

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

  const getMessagingActivityDescription = (): string | null => {
    if (!child.shouldShowNebraskaU18Copy) {
      return null;
    }

    return translate(
      parentalControlsTranslationConstants.friendManagement.childCardViewMessagingActivity,
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
    const messagingActivity = getMessagingActivityDescription();
    if (!child.shouldShowTrustedFriendsDisclaimer && !messagingActivity) {
      return null;
    }

    const disclaimerHtml = child.shouldShowTrustedFriendsDisclaimer
      ? translate(getDisclaimerTranslationKey(), {
          linkStart: `<a class="text-link" target="_blank" rel="noreferrer" href="${trustedConnectionsHelpPageUrl}">`,
          linkEnd: "</a>",
        })
      : "";

    const combinedHtml = messagingActivity
      ? `${messagingActivity} ${disclaimerHtml}`
      : disclaimerHtml;

    return <div className="text-body-medium" dangerouslySetInnerHTML={{ __html: combinedHtml }} />;
  };

  const zeroStateKey: string =
    activeFilter === FriendFilterType.Trusted
      ? parentalControlsTranslationConstants.friendManagement.noTrustedConnections
      : parentalControlsTranslationConstants.friendManagement.carousel.noFriends;

  return (
    <div className="friend-list-container">
      {getDisclaimer()}
      {getChips()}
      <FriendsListSection
        list={list}
        emptyDescriptionTranslationKey={zeroStateKey}
        renderRow={(friend, displayName, userName) => (
          <FriendListItem
            key={friend.id}
            child={child}
            friend={friend}
            displayName={displayName}
            userName={userName}
            isTrusted={trustedFriendIds.has(friend.id)}
          />
        )}
      />
    </div>
  );
};

export default FriendManagementSection;
