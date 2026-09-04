import { httpService } from "@rbx/core-scripts/legacy/core-utilities";
import { playerSearchConstants } from "../constants/playerSearchConstants";
import { getCurrentUser, getPresenceProvider } from "./robloxGlobals";
import { userPresenceTypes } from "../types/extendedUserPresence";
import type { ExtendedUserPresence } from "../types/extendedUserPresence";

export const isInPlayableGame = (presence: {
  universeId?: number;
  userPresenceType?: number;
  gameId?: string;
}): presence is { universeId: number; userPresenceType: number; gameId: string } =>
  Boolean(
    presence.universeId && presence.userPresenceType === userPresenceTypes.game && presence.gameId,
  );

export type GamePlayabilityResult = {
  universeId: number;
  isPlayable: boolean;
};

export const multiGetGamePlayabilityStatuses = async (
  universeIds: number[],
): Promise<GamePlayabilityResult[]> => {
  if (universeIds.length === 0) {
    return [];
  }

  if (!getCurrentUser().isAuthenticated) {
    return universeIds.map(universeId => ({
      universeId,
      isPlayable: false,
    }));
  }

  try {
    const response = await httpService.get<GamePlayabilityResult[]>(
      {
        retryable: true,
        url: playerSearchConstants.urls.gamePlayabilityUrl,
        withCredentials: true,
      },
      {
        universeIds: universeIds.join(","),
      },
    );

    return response.data;
  } catch (error) {
    console.error(
      "playerSearch: game playability lookup failed, dropping Join and the in-game caption line",
      { universeIds, error },
    );

    return universeIds.map(universeId => ({
      universeId,
      isPlayable: false,
    }));
  }
};

export const multiGetIsPlayable = async (
  universeIds: number[],
): Promise<Record<number, boolean>> => {
  const results: Record<number, boolean> = {};

  universeIds.forEach(universeId => {
    results[universeId] = false;
  });

  if (universeIds.length === 0) {
    return results;
  }

  try {
    const playabilityStatuses = await multiGetGamePlayabilityStatuses(universeIds);

    playabilityStatuses.forEach(status => {
      results[status.universeId] = status.isPlayable;
    });
  } catch {
    // no-op
  }

  return results;
};

export const multiGetUserPresences = async (userIds: number[]): Promise<ExtendedUserPresence[]> => {
  if (userIds.length === 0) {
    return [];
  }

  const provider = getPresenceProvider();

  if (!provider?.getPresences) {
    return userIds.map(userId => ({
      userId,
      userPresenceType: 0,
      gameIsPlayable: false,
      lastLocation: "",
    }));
  }

  try {
    const presences = await provider.getPresences(userIds);
    const universeIds = new Set<number>();
    const results: ExtendedUserPresence[] = presences.map(currentPresence => {
      // Parity with Angular: only an in-game presence with a gameId counts as playable.
      // Without the guard a Studio presence that carries a universeId renders a Join Game
      // button and attempts a launch.
      if (isInPlayableGame(currentPresence)) {
        universeIds.add(currentPresence.universeId);
      }

      return {
        userId: currentPresence.userId,
        userPresenceType: currentPresence.userPresenceType,
        lastLocation: currentPresence.lastLocation ?? "",
        universeId: currentPresence.universeId,
        placeId: currentPresence.placeId,
        rootPlaceId: currentPresence.rootPlaceId,
        gameId: currentPresence.gameId,
        gameIsPlayable: false,
      };
    });

    if (universeIds.size > 0) {
      const playableByUniverse = await multiGetIsPlayable([...universeIds]);

      return results.map(currentPresence => {
        if (isInPlayableGame(currentPresence) && playableByUniverse[currentPresence.universeId]) {
          return {
            ...currentPresence,
            gameIsPlayable: true,
          };
        }

        return currentPresence;
      });
    }

    return results;
  } catch (error) {
    console.error("playerSearch: presence fetch failed, every card will read Offline", {
      userIds,
      error,
    });

    return userIds.map(userId => ({
      userId,
      userPresenceType: 0,
      gameIsPlayable: false,
      lastLocation: "",
    }));
  }
};
