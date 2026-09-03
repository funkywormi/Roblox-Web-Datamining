import environmentUrls from "@rbx/environment-urls";
import { get } from "../http";

const GameInfoUrlConfig = {
  url: `${environmentUrls.gamesApi}/v1/games`,
  withCredentials: true,
};

type GameInfoResponse = {
  data?: [
    {
      rootPlaceId?: number;
    },
  ];
};

const getPlaceIdFromUniverseId = (gameId: string): Promise<number> =>
  get<GameInfoResponse>(GameInfoUrlConfig, {
    universeIds: [gameId],
  }).then(response => {
    const rootPlaceId = response.data.data?.[0]?.rootPlaceId;
    if (!rootPlaceId) {
      throw new Error(`Root place ID not found for universe ID: ${gameId}`);
    }
    return rootPlaceId;
  });

export default getPlaceIdFromUniverseId;
