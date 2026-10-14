import React, { useEffect } from "react";
import { authenticatedUser } from "header-scripts";
import { FindFriendsTypes, FindFriendsUserSort } from "../../../../../types/friendsTypes";
import OdpFriendListItem from "./OdpFriendListItem";
import FriendsListSection from "../shared/FriendsListSection";
import useChildFriendsList from "../../../hooks/useChildFriendsList";
import { useGetOdpChildContextQuery } from "../../../../apis/parentalControlsApi";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import ParentalControlsPageName from "../../../../../enums/parentalControls/ParentalControlsPageName";
import { trackCounter } from "./observability";
import { ParentZoneCounter } from "./observability/eventConstants";

export const OdpTopFriendsPage = (): JSX.Element => {
  const { data: odpChildContext } = useGetOdpChildContextQuery();

  useEffect(() => {
    trackCounter(ParentZoneCounter.PageShown, { page: ParentalControlsPageName.FriendManagement });
  }, []);

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
