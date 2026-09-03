import environmentUrls from "@rbx/environment-urls";
import { get } from "../http";

type PlaceDetailsResponse =
  | [
      {
        placeId?: number;
        name?: string;
        description?: string;
        url?: string;
        builder?: string;
        builderId?: number;
        isPlayable?: boolean;
        reasonProhibited?: string;
        universeId?: number;
        universeRootPlaceId?: number;
        price?: number;
        imageToken?: string;
      },
    ]
  | [];

const getUniverseIdFromPlaceId = (placeId: string): Promise<number> => {
  const PlaceDetailsUrlConfig = {
    url: `${environmentUrls.gamesApi}/v1/games/multiget-place-details?placeIds=${parseInt(placeId, 10)}`,
    withCredentials: true,
  };

  return get<PlaceDetailsResponse>(PlaceDetailsUrlConfig).then(response => {
    const universeId = response.data[0]?.universeId;
    if (!universeId) {
      throw new Error(`Universe ID not found for place ID: ${placeId}`);
    }
    return universeId;
  });
};

export default getUniverseIdFromPlaceId;
