import { Button } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { friendshipStatuses } from "../constants/friendshipStatus";
import type { SearchResultUser } from "../types/searchedUser";

type PlayerCardActionsProps = {
  user: SearchResultUser;
  isChatEntrypointEnabled: boolean | null;
  isLoading?: boolean;
  onAcceptFriend: (user: SearchResultUser) => void;
  onAddFriend: (user: SearchResultUser) => void;
  onJoinGame: (user: SearchResultUser) => void;
  onStartChat: (user: SearchResultUser) => void;
};

// Foundation has no 36px height and no 16px/500 composite; ../main.css pins both.
const angularSizeParity = "player-search-action-parity";

// Action.RequestSent is title case in the resource while the rest of the row is sentence case.
const toSentenceCase = (text: string): string => text.charAt(0) + text.slice(1).toLowerCase();

const PlayerCardActions = ({
  user,
  isChatEntrypointEnabled,
  isLoading = false,
  onAcceptFriend,
  onAddFriend,
  onJoinGame,
  onStartChat,
}: PlayerCardActionsProps): React.JSX.Element | null => {
  const { translate } = useTranslation();

  if (user.isCurrentUser) {
    return null;
  }

  switch (user.friendshipStatus) {
    case friendshipStatuses.requestReceived:
      return (
        <Button
          className={`width-full ${angularSizeParity}`}
          isDisabled={isLoading}
          onClick={() => {
            onAcceptFriend(user);
          }}
          size="Medium"
          variant="Standard"
        >
          {translate("Action.AcceptRequest")}
        </Button>
      );
    case friendshipStatuses.requestSent:
      return (
        <Button
          className={`width-full ${angularSizeParity}`}
          isDisabled
          size="Medium"
          variant="Standard"
        >
          {toSentenceCase(translate("Action.RequestSent"))}
        </Button>
      );
    case friendshipStatuses.friends: {
      const showJoin = user.gameIsPlayable;
      // Parity with Angular's `ng-if="layout.isChatEntrypointEnabled"`: render only once the
      // policy is known to be on. Treating the unresolved (null) state as "show" put a disabled
      // Chat button on screen for the ~5s the entrypoint hook polls.
      const showChat = isChatEntrypointEnabled === true;

      if (!showJoin && !showChat) {
        return null;
      }

      return (
        <div className={showJoin && showChat ? "flex gap-medium" : undefined}>
          {showJoin ? (
            <Button
              className={`${showChat ? "grow" : "width-full"} ${angularSizeParity}`}
              isDisabled={isLoading}
              onClick={() => {
                onJoinGame(user);
              }}
              size="Medium"
              variant="Emphasis"
            >
              {translate("Action.JoinGame")}
            </Button>
          ) : null}
          {showChat ? (
            <Button
              className={`${showJoin ? "grow" : "width-full"} ${angularSizeParity}`}
              isDisabled={isLoading}
              onClick={() => {
                onStartChat(user);
              }}
              size="Medium"
              variant="Standard"
            >
              {translate("Action.Chat")}
            </Button>
          ) : null}
        </div>
      );
    }
    case friendshipStatuses.notFriends:
      return (
        <Button
          className={`width-full ${angularSizeParity}`}
          isDisabled={isLoading}
          onClick={() => {
            onAddFriend(user);
          }}
          size="Medium"
          variant="Standard"
        >
          {translate("Action.AddFriend")}
        </Button>
      );
    default:
      return null;
  }
};

export default PlayerCardActions;
