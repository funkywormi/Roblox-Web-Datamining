import Presence from "@rbx/presence";
import { TGetFriendsResponse, TPresenseUpdateEvent } from "../../common/types/bedev1Types";
import { TSduiInGameFriendsByUniverseId } from "../system/SduiTypes";

export const getInGameFriendsByUniverseIdFromFriendDetails = (
  friendDetails: Record<number, TGetFriendsResponse>,
): TSduiInGameFriendsByUniverseId => {
  const inGameFriendsByUniverseId: TSduiInGameFriendsByUniverseId = {};

  Object.values(friendDetails).forEach(friend => {
    if (
      friend.presence?.universeId !== undefined &&
      friend.presence?.userPresenceType === Presence.PresenceType.Game
    ) {
      if (!inGameFriendsByUniverseId[friend.presence.universeId]) {
        inGameFriendsByUniverseId[friend.presence.universeId] = [];
      }

      inGameFriendsByUniverseId[friend.presence.universeId]!.push({
        userId: friend.id,
        displayName: friend.displayName,
        presence: {
          gameId: friend.presence.gameId,
          placeId: friend.presence.placeId,
          rootPlaceId: friend.presence.rootPlaceId,
        },
      });
    }
  });

  return inGameFriendsByUniverseId;
};

export const isPresenceUpdateEvent = (event: Event): event is TPresenseUpdateEvent => {
  return event.type === "Roblox.Presence.Update" && "detail" in event;
};
