import { CurrentUser, EnvironmentUrls } from 'Roblox';
import { httpService } from 'core-utilities';
import Presence from 'roblox-presence';
import { ExtendedUserPresence } from '../types/extended-user-presence';

// The result returned from the games API.
type GamePlayabilityResult = {
  universeId: number;
  isPlayable: boolean;
};

// Fetches whether the game is playable by the authenticated user.
const multiGetGamePlayabilityStatuses = async (
  universeIds: number[]
): Promise<GamePlayabilityResult[]> => {
  if (universeIds.length < 1) {
    // Return empty when nothing is requested.
    return [];
  }

  if (!CurrentUser.isAuthenticated) {
    // If not logged in, the answer is always no.
    return universeIds.map(universeId => {
      return { universeId, isPlayable: false };
    });
  }

  try {
    const response = await httpService.get<GamePlayabilityResult[]>(
      {
        retryable: true,
        url: `${EnvironmentUrls.gamesApi}/v1/games/multiget-playability-status`,
        withCredentials: true
      },
      {
        universeIds: universeIds.join(',')
      }
    );

    return response.data;
  } catch {
    // If the request fails, assume we can't play it.
    // This so we don't break the player search results.
    return universeIds.map(universeId => {
      return { universeId, isPlayable: false };
    });
  }
};

// Fetches a map which is (exclusively) yes or no, if the authenticated user can play the universes.
const multiGetIsPlayable = async (
  universeIds: number[]
): Promise<{ [universeId: number]: boolean }> => {
  const result: { [universeId: number]: boolean } = {};
  if (universeIds.length < 1) {
    // If there's nothing to fetch, do nothing.
    return result;
  }

  // Populate the result with all the universe IDs
  universeIds.forEach(universeId => {
    result[universeId] = false;
  });

  try {
    const playabilityStatuses = await multiGetGamePlayabilityStatuses(Array.from(universeIds));
    playabilityStatuses.forEach(status => {
      result[status.universeId] = status.isPlayable;
    });
  } catch {
    // continue, and assume not playable if we fail to load the data
  }

  return result;
};

// Fetches an extended version of user presences.
const multiGetUserPresences = async (userIds: number[]): Promise<ExtendedUserPresence[]> => {
  if (userIds.length < 1) {
    // If there's nothing to fetch, do nothing.
    return [];
  }

  try {
    const presences = await Presence.getPresenceProvider().getPresences(userIds);
    const universeIds = new Set<number>();
    const result: ExtendedUserPresence[] = [];
    for (let i in presences) {
      const presence = presences[i];
      result.push({
        // Default to the game not being playable, in case we fail to load the playability status later.
        gameIsPlayable: false,
        ...presence
      });

      if (
        presence.universeId &&
        presence.userPresenceType === Presence.PresenceType.Game &&
        presence.gameId
      ) {
        universeIds.add(presence.universeId);
      }
    }

    if (universeIds.size > 0) {
      const playabilityStatuses = await multiGetIsPlayable(Array.from(universeIds));
      result.forEach(presence => {
        if (
          presence.universeId &&
          playabilityStatuses[presence.universeId] &&
          presence.userPresenceType === Presence.PresenceType.Game &&
          presence.gameId
        ) {
          presence.gameIsPlayable = true;
        }
      });
    }

    return result;
  } catch {
    // If we fail to load presence, assume everyone is offline.
    // This to not break player search results.
    return userIds.map(userId => {
      const offlinePresence: ExtendedUserPresence = {
        userId,
        userPresenceType: Presence.PresenceType.Offline,
        gameIsPlayable: false,
        lastLocation: ''
      };

      return offlinePresence;
    });
  }
};

export default { multiGetUserPresences, multiGetGamePlayabilityStatuses, multiGetIsPlayable };
