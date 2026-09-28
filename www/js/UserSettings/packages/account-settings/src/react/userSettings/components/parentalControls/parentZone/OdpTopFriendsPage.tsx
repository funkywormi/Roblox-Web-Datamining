import React from "react";
import { authenticatedUser } from "header-scripts";
import { FindFriendsTypes, FindFriendsUserSort } from "../../../../../types/friendsTypes";
import OdpFriendListItem from "./OdpFriendListItem";
import FriendsListSection from "../shared/FriendsListSection";
import useChildFriendsList from "../../../hooks/useChildFriendsList";
import { useGetOdpChildContextQuery } from "../../../../apis/parentalControlsApi";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";

export const OdpTopFriendsPage = (): JSX.Element => {
  const { data: odpChildContext } = useGetOdpChildContextQuery();

  const list = useChildFriendsList({
    userId: authenticatedUser.id!,
    userSort: FindFriendsUserSort.FriendScore,
    findFriendsType: FindFriendsTypes.Friends,
  });

  return (
    <div className="friend-list-container">
      <FriendsListSection
        list={list}
        emptyDescriptionTranslationKey={
          parentalControlsTranslationConstants.friendManagement.carousel.noFriends
        }
        renderRow={(friend, displayName, userName) => (
          <OdpFriendListItem
            key={friend.id}
            friend={friend}
            displayName={displayName}
            userName={userName}
            canManageFriends={odpChildContext?.canParentManageChildsFriends === true}
          />
        )}
      />
    </div>
  );
};

export default OdpTopFriendsPage;
