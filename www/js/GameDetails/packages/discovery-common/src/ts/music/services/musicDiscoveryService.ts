import { Configuration } from "@rbx/clients";
import {
  MusicDiscoveryServiceAPIApi,
  type GetExperienceSongsResponse,
} from "@rbx/clients/musicDiscovery/v1";
import environmentUrls from "@rbx/environment-urls";
import { TOP_SONGS_IN_GAME_OVERRIDES } from "../constants";

// ---------------------------------------------------------------------------
// Client setup
// ---------------------------------------------------------------------------

const configuration = new Configuration({
  basePath: `${environmentUrls.apiGatewayUrl}/music-discovery`,
  credentials: "include",
});

const musicDiscoveryApi = new MusicDiscoveryServiceAPIApi(configuration);

// ---------------------------------------------------------------------------
// Exported API functions
// ---------------------------------------------------------------------------

/**
 * GETs top songs for an experience from music-discovery (`experience-songs`).
 */
export function fetchTopSongsInGame(
  universeId: string,
  limit: number = TOP_SONGS_IN_GAME_OVERRIDES.topSongsInGameLimit,
): Promise<GetExperienceSongsResponse> {
  if (!universeId) {
    return Promise.resolve({ songs: [] });
  }

  return musicDiscoveryApi.v1ExperienceSongsGet({
    universeId: Number(universeId),
    limit,
  });
}
