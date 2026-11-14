import { JSX } from "react";
import "@rbx/core-scripts/global";
import { chatService } from "@rbx/core-scripts/legacy/core-roblox-utilities";
import { TranslateFunction } from "@rbx/core-scripts/legacy/react-utilities";
import { Button } from "@rbx/core-ui";
import { Thumbnail2d, ThumbnailTypes, ThumbnailGameIconSize } from "@rbx/thumbnails";
import { TFriend } from "../types/friendsCarousel";
import { followFriendIntoGame } from "../utils/followFriendIntoGame";
import IARCInGameCard from "./IARCInGameCard";

const FriendTileDropdown = ({
  friend,
  displayName,
  userProfileUrl,
  userPresence,
  isInGame,
  gameUrl,
  universeId,
  canChat,
  translate,
  isIARCJoinCardRedesignEnabled,
  isIARCJoinCardGameRowClickableEnabled,
  sendGameRowClickEvent,
}: {
  friend: TFriend;
  displayName: string;
  userProfileUrl: string;
  userPresence: string | null | undefined;
  isInGame: boolean;
  gameUrl: string;
  universeId: number;
  canChat: boolean;
  translate: TranslateFunction;
  isIARCJoinCardRedesignEnabled: boolean;
  isIARCJoinCardGameRowClickableEnabled: boolean;
  sendGameRowClickEvent: () => void;
}): JSX.Element => {
  const launchGame = async () => {
    await followFriendIntoGame({
      friendUserId: friend.id,
      joinAttemptId: friend.presence.gameId ?? "",
    });
  };

  const startChat = () => {
    chatService.startDesktopAndMobileWebChat({ userId: friend.id });
  };

  if (isIARCJoinCardRedesignEnabled && isInGame && userPresence != null) {
    return (
      <IARCInGameCard
        displayName={displayName}
        userPresence={userPresence}
        universeId={universeId}
        userProfileUrl={userProfileUrl}
        canChat={canChat}
        translate={translate}
        launchGame={launchGame}
        gameUrl={gameUrl}
        placeId={friend.presence.placeId ?? null}
        isIARCJoinCardGameRowClickableEnabled={isIARCJoinCardGameRowClickableEnabled}
        sendGameRowClickEvent={sendGameRowClickEvent}
        startChat={startChat}
      />
    );
  }

  return (
    <div className="friend-tile-dropdown">
      {isInGame && userPresence != null && (
        <div className="in-game-friend-card">
          <button
            type="button"
            className="friend-tile-non-styled-button"
            onClick={() => {
              window.open(gameUrl);
            }}
          >
            <Thumbnail2d
              type={ThumbnailTypes.gameIcon}
              size={ThumbnailGameIconSize.size150}
              targetId={universeId}
              imgClassName="game-card-thumb"
              containerClass="friend-tile-game-card"
            />
          </button>
          <div className="friend-presence-info">
            <button
              type="button"
              className="friend-tile-non-styled-button"
              onClick={() => {
                window.open(gameUrl);
              }}
            >
              {userPresence}
            </button>
            <Button
              variant={Button.variants.growth}
              size={Button.sizes.small}
              width={Button.widths.full}
              // TODO: old, migrated code
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onClick={launchGame}
            >
              {translate("Action.Join")}
            </Button>
          </div>
        </div>
      )}
      <ul>
        {canChat && (
          <li>
            <button type="button" className="friend-tile-dropdown-button" onClick={startChat}>
              <span className="icon-chat-gray" />{" "}
              {translate("Label.Chat", { username: displayName })}
            </button>
          </li>
        )}
        <li>
          <button
            type="button"
            className="friend-tile-dropdown-button"
            onClick={() => {
              window.open(userProfileUrl);
            }}
          >
            <span className="icon-viewdetails" /> {translate("Label.ViewProfile")}
          </button>
        </li>
      </ul>
    </div>
  );
};
export default FriendTileDropdown;
