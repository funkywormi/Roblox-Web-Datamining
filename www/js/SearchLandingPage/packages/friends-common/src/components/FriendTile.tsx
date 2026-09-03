import { JSX } from "react";
import { EventContext } from "@rbx/unified-logging";
import environmentUrls from "@rbx/environment-urls";
import { TranslateFunction } from "@rbx/core-scripts/legacy/react-utilities";
import Presence from "@rbx/presence";
import { TFriend } from "../types/friendsCarousel";
import FriendTileContent from "./FriendTileContent";
import FriendTileDropDown from "./FriendTileDropdown";
import FriendTilePopover from "./FriendTilePopover";
import useFriendsCarouselClickTracker from "../hooks/useFriendsCarouselClickTracker";
import FriendCarouselNames from "../constants/friendCarouselNames";
import { unavailableFriendName } from "../constants/friendsCarouselConstants";

const DROPDOWN_WIDTH = 240;
const DROPDOWN_WIDTH_INGAME = 315;
const DROPDOWN_WIDTH_INGAME_IARC = 260;

const FriendTile = ({
  friend,
  friendIndex,
  isOwnUser,
  translate,
  canChat,
  carouselName,
  eventContext,
  homePageSessionInfo,
  sortId,
  sortPosition,
  totalNumberOfFriends,
  isIARCJoinCardRedesignEnabled,
  isIARCJoinCardGameRowClickableEnabled,
}: {
  friend: TFriend;
  friendIndex: number;
  isOwnUser: boolean;
  translate: TranslateFunction;
  canChat: boolean;
  carouselName: FriendCarouselNames;
  eventContext: EventContext;
  homePageSessionInfo: string | undefined;
  sortId: number | undefined;
  sortPosition: number | undefined;
  totalNumberOfFriends: number;
  isIARCJoinCardRedesignEnabled: boolean;
  isIARCJoinCardGameRowClickableEnabled: boolean;
}): JSX.Element => {
  const userProfileUrl = `${environmentUrls.websiteUrl}/users/${friend.id}/profile`;
  const displayName = friend.combinedName ?? translate(unavailableFriendName);

  const presence = Presence.usePresence(friend.id, undefined);
  const isInGame = presence.gameId != null;
  const userPresenceFull = isInGame ? presence.lastLocation : null;

  const userPresence =
    userPresenceFull != null && userPresenceFull.length > 15
      ? `${userPresenceFull.slice(0, 15)}...`
      : userPresenceFull;

  const gameUrl = isInGame ? `${environmentUrls.websiteUrl}/games/${presence.placeId ?? ""}` : "";

  const sendClickEvent = useFriendsCarouselClickTracker(
    friend,
    friendIndex,
    carouselName,
    eventContext,
    homePageSessionInfo,
    sortId,
    sortPosition,
    totalNumberOfFriends,
  );

  const sendGameRowClickEvent = useFriendsCarouselClickTracker(
    friend,
    friendIndex,
    carouselName,
    eventContext,
    homePageSessionInfo,
    sortId,
    sortPosition,
    totalNumberOfFriends,
    "OpenGameDetails",
  );

  return (
    <div className="friends-carousel-tile">
      <FriendTilePopover
        ariaLabel={displayName}
        trigger={
          <button
            type="button"
            className="options-dropdown"
            id="friend-tile-button"
            onClick={() => {
              /* This component needs to a be a button, but it's onClick should not do anything. */
            }}
          >
            <FriendTileContent
              id={friend.id}
              displayName={displayName}
              userProfileUrl={userProfileUrl}
              userPresence={userPresence}
              translate={translate}
              hasVerifiedBadge={friend.hasVerifiedBadge}
              isRobloxPlus={friend.isRobloxPlus}
              sendClickEvent={sendClickEvent}
            />
          </button>
        }
        content={
          isOwnUser ? (
            <FriendTileDropDown
              friend={friend}
              isInGame={isInGame}
              universeId={presence.universeId ?? 0}
              displayName={displayName}
              userProfileUrl={userProfileUrl}
              userPresence={userPresenceFull}
              translate={translate}
              gameUrl={gameUrl}
              canChat={canChat}
              isIARCJoinCardRedesignEnabled={isIARCJoinCardRedesignEnabled}
              isIARCJoinCardGameRowClickableEnabled={isIARCJoinCardGameRowClickableEnabled}
              sendGameRowClickEvent={sendGameRowClickEvent}
            />
          ) : (
            <div />
          )
        }
        dropdownWidth={
          userPresence == null
            ? DROPDOWN_WIDTH
            : isIARCJoinCardRedesignEnabled
              ? DROPDOWN_WIDTH_INGAME_IARC
              : DROPDOWN_WIDTH_INGAME
        }
      />
    </div>
  );
};

export default FriendTile;
