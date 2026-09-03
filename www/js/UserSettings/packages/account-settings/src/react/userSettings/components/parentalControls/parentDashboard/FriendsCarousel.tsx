import React, { useMemo } from "react";
import { useUserProfiles, UserProfileField } from "@rbx/user-profile-api-client";
import { useGetChildFriendsQuery } from "../../../../apis/parentalControlsApi";
import { FindFriendsTypes, FindFriendsUserSort } from "../../../../../types/friendsTypes";
import FriendItem from "./FriendItem";
import { maxFriendsInCarousel } from "../../../constants/parentalControls/friendManagementConstants";

export const FriendsCarousel = ({ userId }: { userId: number }): JSX.Element => {
  const { data: friendData } = useGetChildFriendsQuery({
    userId,
    userSort: FindFriendsUserSort.FriendScore,
    findFriendsType: FindFriendsTypes.Friends,
    limit: maxFriendsInCarousel,
  });

  const friendIds: number[] = useMemo(
    () => Object.values(friendData?.PageItems || {}).map(friend => friend.id),
    [friendData],
  );

  const userProfileFields = [UserProfileField.Names.CombinedName];
  const { data: friendNames } = useUserProfiles(friendIds, userProfileFields);

  const getFriendItems = (): JSX.Element | undefined => {
    const listItems: JSX.Element[] = [];
    Object.values(friendData?.PageItems || {}).forEach(friend => {
      if (listItems.length >= maxFriendsInCarousel) return;
      if (!friend) return;

      const userName = friendNames?.[friend.id]?.names?.combinedName ?? "";
      listItems.push(
        <li key={friend.id} className="friend-carousel-item">
          <FriendItem friend={friend} userName={userName} />
        </li>,
      );
    });
    return <React.Fragment>{listItems}</React.Fragment>;
  };

  return (
    <div className="friends-carousel-container">
      <div className="friends-carousel">
        <ul>{getFriendItems()}</ul>
      </div>
    </div>
  );
};

export default FriendsCarousel;
