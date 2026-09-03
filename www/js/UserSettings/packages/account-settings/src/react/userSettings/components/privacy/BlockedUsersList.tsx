/* eslint-disable no-void */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { UserProfileField } from "@rbx/user-profile-api-client";
import { Chip } from "@rbx/foundation-ui";
import StackedUserInput from "../../../common/components/StackedUserInput";
import InformationalScreen from "../../../common/components/InformationalScreen";
import {
  useGetBlockedUsersQuery,
  useLazyGetBlockedUsersQuery,
} from "../../../apis/userBlockingApi";
import { blockedUsersPageSize } from "../../constants/privacy/privacyConstants";
import privacyTranslationConstants from "../../constants/contentConstants/privacyTranslationConstants";
import commonTranslationConstants from "../../constants/contentConstants/commonTranslationConstants";
import BlockedUserWithParentalConsent from "./BlockedUserWithParentalConsent";
import { useWrappedTranslation } from "../../hooks/useWrappedTranslation";
import { TChildInfo } from "../../../../types/childrenInfoTypes";
import {
  BlockedUserFilterType,
  BlockedUsersQueryParams,
  TBlockManagerType,
} from "../../../../types/privacyTypes";
import useIncrementalUserProfiles from "../../../apis/hooks/useIncrementalGetUserProfiles";

export const BlockedUsersList = ({
  child,
  shouldShowParentalRelationshipView = false, // We should show chips for users with a parent/child with a blocking relationship
}: {
  child?: TChildInfo;
  shouldShowParentalRelationshipView?: boolean;
}): JSX.Element => {
  const { translate } = useWrappedTranslation();
  const [userSelectedFilter, setUserSelectedFilter] = useState<BlockedUserFilterType>(
    BlockedUserFilterType.All,
  );
  const activeFilter = shouldShowParentalRelationshipView
    ? userSelectedFilter
    : BlockedUserFilterType.All;

  const chipFilters = useMemo(() => {
    const allChip = {
      key: BlockedUserFilterType.All,
      text: translate(privacyTranslationConstants.all),
    };

    if (child) {
      return [
        allChip,
        {
          key: BlockedUserFilterType.Child,
          text: translate(privacyTranslationConstants.blockedByChild),
        },
        {
          key: BlockedUserFilterType.Parent,
          text: translate(privacyTranslationConstants.blockedByYou),
        },
      ];
    }

    return [
      allChip,
      {
        key: BlockedUserFilterType.Child,
        text: translate(privacyTranslationConstants.blockedByYou),
      },
      {
        key: BlockedUserFilterType.Parent,
        text: translate(privacyTranslationConstants.blockedByYourParent),
      },
    ];
  }, [translate, child]);

  const queryParams = useMemo((): BlockedUsersQueryParams => {
    const params: BlockedUsersQueryParams = {
      cursor: "",
      count: blockedUsersPageSize,
      childUserId: child?.userId,
    };

    if (activeFilter === BlockedUserFilterType.Child) {
      // This maps to "Blocked by child" on the parent side OR "Blocked by user" on the child side
      params.managerTypeFilter = TBlockManagerType.Blocker;
    } else if (activeFilter === BlockedUserFilterType.Parent) {
      // This maps to "Blocked by you" on the parent side OR "Blocked by parent" on the child side
      params.managerTypeFilter = TBlockManagerType.Parent;
    }
    return params;
  }, [activeFilter, child]);

  const { data: blockedUsersData, isError, isLoading } = useGetBlockedUsersQuery(queryParams);
  const [fetchNextBlockedUsers, { isFetching: isFetchingNextPage }] = useLazyGetBlockedUsersQuery();
  const userProfileFields = [UserProfileField.Names.CombinedName, UserProfileField.Names.Username];
  const blockedUsers = useMemo(() => blockedUsersData?.data.blockedUsers ?? [], [blockedUsersData]);
  const { data: userProfiles, loading: userProfilesLoading } = useIncrementalUserProfiles(
    blockedUsers.map(user => user.blockedUserId),
    userProfileFields,
  );

  const fetchBlockedUsers = useCallback(async () => {
    if (!isLoading && blockedUsersData?.data.cursor) {
      const nextParams: BlockedUsersQueryParams = {
        cursor: blockedUsersData.data.cursor,
        count: blockedUsersPageSize,
        childUserId: child?.userId,
      };
      if (activeFilter === BlockedUserFilterType.Child) {
        nextParams.managerTypeFilter = TBlockManagerType.Blocker;
      } else if (activeFilter === BlockedUserFilterType.Parent) {
        nextParams.managerTypeFilter = TBlockManagerType.Parent;
      }
      await fetchNextBlockedUsers(nextParams);
    }
  }, [blockedUsersData, fetchNextBlockedUsers, isLoading, activeFilter, child]);

  const { ref, inView } = useInView();
  useEffect(() => {
    if (inView && blockedUsersData?.data.cursor && !isFetchingNextPage && !userProfilesLoading) {
      void fetchBlockedUsers();
    }
  }, [inView, blockedUsersData, isFetchingNextPage, userProfilesLoading, fetchBlockedUsers]);

  const getBlockedUsersComponents = () => {
    return blockedUsers.map(blockedUser => {
      const { blockedUserId } = blockedUser;
      const userProfile = userProfiles?.[blockedUserId];

      const isUnblockDisabled = child && blockedUser.blockManagerType === TBlockManagerType.Blocker; // Parent can not unblock someone their child blocked
      const canRequestUnblock =
        !child &&
        shouldShowParentalRelationshipView &&
        blockedUser.blockManagerType === TBlockManagerType.Parent; // Child can not unblock someone their parent blocked, unless the parent no longer has block permissions (i.e. showParentChildChips is false)

      return (
        <BlockedUserWithParentalConsent
          key={blockedUserId}
          blockedCombinedName={userProfile?.names.combinedName}
          blockedUser={blockedUser}
          blockedUsername={userProfile?.names.username}
          unblockDisabled={isUnblockDisabled}
          canRequestUnblock={canRequestUnblock}
          child={child}
        />
      );
    });
  };

  const getChips = (): JSX.Element | null => {
    if (!shouldShowParentalRelationshipView) {
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

  const getListContent = () => {
    if (isLoading) {
      return null; // Render nothing for the content area while loading
    }

    if (isError) {
      return (
        <InformationalScreen descriptionTranslationKey={commonTranslationConstants.unknownError} />
      );
    }

    if (blockedUsers.length === 0) {
      return (
        <InformationalScreen
          descriptionTranslationKey={privacyTranslationConstants.noBlockedUsersDescription}
        />
      );
    }

    return (
      <StackedUserInput inputId="show-blocked-users">
        <div className="blocked-list">
          {getBlockedUsersComponents()}
          {blockedUsersData?.data.cursor && <div ref={ref} />}
        </div>
      </StackedUserInput>
    );
  };

  return (
    <div className="blocked-users-container">
      {getChips()}
      {getListContent()}
    </div>
  );
};
export default BlockedUsersList;
