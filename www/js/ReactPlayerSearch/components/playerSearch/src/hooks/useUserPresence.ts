import { useEffect } from "react";
import { isInPlayableGame, multiGetGamePlayabilityStatuses } from "../services/presenceService";
import { getPresenceProvider } from "../services/robloxGlobals";
import type { SearchResultUser } from "../types/searchedUser";

type ApplyPresenceUpdate = (userId: number, update: Partial<SearchResultUser>) => void;

export const useUserPresence = (userIds: number[], applyPresenceUpdate: ApplyPresenceUpdate) => {
  useEffect(() => {
    if (userIds.length === 0) {
      return;
    }

    const provider = getPresenceProvider();

    if (!provider?.subscribeToPresenceChanges) {
      return;
    }

    const unsubscribe = provider.subscribeToPresenceChanges(
      userIds,
      currentPresence => {
        applyPresenceUpdate(currentPresence.userId, {
          userPresenceType: currentPresence.userPresenceType,
          gameId: currentPresence.gameId,
          placeId: currentPresence.placeId,
          universeId: currentPresence.universeId,
          rootPlaceId: currentPresence.rootPlaceId,
          lastLocation: currentPresence.lastLocation ?? "",
        });

        if (!isInPlayableGame(currentPresence)) {
          applyPresenceUpdate(currentPresence.userId, {
            gameIsPlayable: false,
          });

          return;
        }

        multiGetGamePlayabilityStatuses([currentPresence.universeId])
          .then(([status]) => {
            applyPresenceUpdate(currentPresence.userId, {
              gameIsPlayable: status?.isPlayable ?? false,
            });
          })
          .catch(() => {
            applyPresenceUpdate(currentPresence.userId, {
              gameIsPlayable: false,
            });
          });
      },
      false,
    );

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [applyPresenceUpdate, userIds]);
};
