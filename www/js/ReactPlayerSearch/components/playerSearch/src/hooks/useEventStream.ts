import { useMemo } from "react";
import { playerSearchConstants } from "../constants/playerSearchConstants";
import type { SearchResultUser } from "../types/searchedUser";
import { getCurrentUser, getEventStream } from "../services/robloxGlobals";

const sendPlayerEvent = (eventName: string, targetUser: SearchResultUser) => {
  const eventStream = getEventStream();

  if (!eventStream?.SendEventWithTarget) {
    return;
  }

  eventStream.SendEventWithTarget(
    eventName,
    playerSearchConstants.playerSearchEventContext,
    {
      // Angular sends CurrentUser.userId unconverted; keep it a string so the
      // event-stream column type doesn't change under the migration.
      uid: getCurrentUser().userId,
      playerId: targetUser.id,
      absPos: targetUser.absPos,
    },
    eventStream.TargetTypes.WWW,
  );
};

export const useEventStream = () => {
  return useMemo(
    () => ({
      firePlayerTileImpressionEvent: (targetUser: SearchResultUser) => {
        sendPlayerEvent(playerSearchConstants.eventNames.playerTileImpression, targetUser);
      },
      firePlayerTileClickEvent: (targetUser: SearchResultUser) => {
        sendPlayerEvent(playerSearchConstants.eventNames.playerTileClick, targetUser);
      },
      firePlayerFriendAddEvent: (targetUser: SearchResultUser) => {
        sendPlayerEvent(playerSearchConstants.eventNames.playerFriendAdd, targetUser);
      },
      firePlayerFriendAcceptEvent: (targetUser: SearchResultUser) => {
        sendPlayerEvent(playerSearchConstants.eventNames.playerFriendAccept, targetUser);
      },
    }),
    [],
  );
};
