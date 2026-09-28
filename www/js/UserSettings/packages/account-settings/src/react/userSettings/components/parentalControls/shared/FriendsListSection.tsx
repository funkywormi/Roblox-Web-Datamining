import React from "react";
import InformationalScreen from "../../../../common/components/InformationalScreen";
import StackedUserInput from "../../../../common/components/StackedUserInput";
import { TFriendResponse } from "../../../../../types/friendsTypes";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import { TChildFriendsList } from "../../../hooks/useChildFriendsList";

export const FriendsListSection = ({
  list,
  emptyDescriptionTranslationKey,
  renderRow,
}: {
  list: TChildFriendsList;
  emptyDescriptionTranslationKey: string;
  renderRow: (friend: TFriendResponse, displayName: string, userName: string) => JSX.Element;
}): JSX.Element | null => {
  const { friends, friendNames, isLoading, isError, hasMore, loadMoreRef } = list;

  if (isLoading) {
    return null;
  }

  if (isError) {
    return (
      <div className="friend-management-section">
        <InformationalScreen
          descriptionTranslationKey={parentalControlsTranslationConstants.errorLoadingList}
        />
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="friend-management-section">
        <InformationalScreen descriptionTranslationKey={emptyDescriptionTranslationKey} />
      </div>
    );
  }

  return (
    <div className="friend-management-section">
      <StackedUserInput inputId="show-friend-list">
        <div className="friend-list">
          {friends.map(friend =>
            renderRow(
              friend,
              friendNames?.[friend.id]?.names?.combinedName ?? "",
              friendNames?.[friend.id]?.names?.username ?? "",
            ),
          )}
          {hasMore && <div ref={loadMoreRef} />}
        </div>
      </StackedUserInput>
    </div>
  );
};

export default FriendsListSection;
