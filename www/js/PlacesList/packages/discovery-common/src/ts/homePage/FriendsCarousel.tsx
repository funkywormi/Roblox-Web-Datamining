import React from "react";
import { EventContext } from "@rbx/unified-logging";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import {
  FriendsCarousel as FriendsCarouselContainer,
  FriendCarouselNames,
} from "@rbx/friends-common";

import "../../css/homePage/friendsCarousel.scss";

type TFriendsCarouselProps = {
  homePageSessionInfo: string;
  sortId: number | undefined;
  sortPosition: number;
};

const FriendsCarousel = ({
  homePageSessionInfo,
  sortId,
  sortPosition,
}: TFriendsCarouselProps): JSX.Element => {
  const userDataMetaTag = document.querySelector('meta[name="user-data"]');
  const profileUserId: number = (
    userDataMetaTag
      ? userDataMetaTag.getAttribute("data-userid")
      : Number(authenticatedUser()?.id ?? "0")
  ) as number;

  return (
    <div className="friend-carousel-container">
      <FriendsCarouselContainer
        profileUserId={profileUserId}
        isOwnUser
        carouselName={FriendCarouselNames.WebHomeFriendsCarousel}
        eventContext={EventContext.Home}
        homePageSessionInfo={homePageSessionInfo}
        sortId={sortId}
        sortPosition={sortPosition}
      />
    </div>
  );
};

export default FriendsCarousel;
