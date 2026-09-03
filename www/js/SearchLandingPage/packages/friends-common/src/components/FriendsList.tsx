import { JSX, useEffect, useRef, useState } from "react";
import { EventContext } from "@rbx/unified-logging";
import FriendTile from "./FriendTile";
import { TFriend } from "../types/friendsCarousel";
import useFriendsCarouselImpressionTracker from "../hooks/useFriendsCarouselImpressionTracker";
import FriendCarouselNames from "../constants/friendCarouselNames";
import AddFriendsTile from "./AddFriendsTile";

const FRIEND_TILE_WIDTH = 110;

const FriendsList = ({
  friendsList,
  isOwnUser,
  translate,
  canChat,
  carouselName,
  eventContext,
  homePageSessionInfo,
  sortId,
  sortPosition,
  badgeCount,
  isAddFriendsTileEnabled,
  isIARCJoinCardRedesignEnabled,
  isIARCJoinCardGameRowClickableEnabled,
}: {
  friendsList: TFriend[] | null;
  isOwnUser: boolean;
  translate: (key: string) => string;
  canChat: boolean;
  carouselName: FriendCarouselNames;
  eventContext: EventContext;
  homePageSessionInfo: string | undefined;
  sortId: number | undefined;
  sortPosition: number | undefined;
  badgeCount: number;
  isAddFriendsTileEnabled: boolean;
  isIARCJoinCardRedesignEnabled: boolean;
  isIARCJoinCardGameRowClickableEnabled: boolean;
}): JSX.Element => {
  const parentRef = useRef<HTMLElement | null>(null);
  const [visibleFriendsList, setVisibleFriendsList] = useState(friendsList);

  const [listIsFull, setListIsFull] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const shouldShowAddFriendsTile =
    carouselName === FriendCarouselNames.WebHomeFriendsCarousel && isAddFriendsTileEnabled;

  useEffect(() => {
    const el = parentRef.current;
    if (el == null) {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      setContainerWidth(el.offsetWidth);
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const totalWidth = containerWidth ?? parentRef.current?.offsetWidth;
    const friendListLength = friendsList?.length ?? 0;

    if (totalWidth != null && friendsList != null) {
      const visibleTileCount = Math.floor(totalWidth / FRIEND_TILE_WIDTH);
      const totalTilesNeeded = shouldShowAddFriendsTile ? friendListLength + 1 : friendListLength;

      setListIsFull(FRIEND_TILE_WIDTH * totalTilesNeeded > totalWidth);
      setVisibleFriendsList(
        friendsList.slice(0, visibleTileCount - (shouldShowAddFriendsTile ? 1 : 0)),
      );
    }
  }, [containerWidth, friendsList, shouldShowAddFriendsTile]);

  useFriendsCarouselImpressionTracker(
    containerRef,
    // https://roblox.atlassian.net/browse/CLIGROW-2178
    // Send friendsList instead of visibleFriendsList to workaround
    // race condition where visibleFriendsList is not updated yet
    friendsList,
    carouselName,
    eventContext,
    homePageSessionInfo,
    sortId,
    sortPosition,
  );

  return (
    <div>
      <div
        ref={el => {
          parentRef.current = el;
          return parentRef.current;
        }}
        className="friends-carousel-container"
      >
        {visibleFriendsList == null ? (
          <span className="spinner spinner-default" />
        ) : (
          <div
            ref={containerRef}
            className={
              listIsFull
                ? "friends-carousel-list-container"
                : "friends-carousel-list-container-not-full"
            }
          >
            {shouldShowAddFriendsTile ? (
              <AddFriendsTile
                key="add-friends-tile"
                translate={translate}
                badgeCount={badgeCount}
                data-testid="add-friends-tile"
              />
            ) : null}
            {visibleFriendsList.map((item, index) => (
              <div key={item.id}>
                <FriendTile
                  friend={item}
                  friendIndex={index}
                  translate={translate}
                  isOwnUser={isOwnUser}
                  canChat={canChat}
                  carouselName={carouselName}
                  eventContext={eventContext}
                  homePageSessionInfo={homePageSessionInfo}
                  sortId={sortId}
                  sortPosition={sortPosition}
                  totalNumberOfFriends={friendsList?.length ?? 0}
                  isIARCJoinCardRedesignEnabled={isIARCJoinCardRedesignEnabled}
                  isIARCJoinCardGameRowClickableEnabled={isIARCJoinCardGameRowClickableEnabled}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsList;
