import { useQuery } from "@tanstack/react-query";
import environmentUrls from "@rbx/environment-urls";
import { chatQueryKeys } from "../constants/queryKeys";
import chatHttpTransport from "../services/chatHttpTransport";

type TPlaceDetailsResponse = {
  placeId?: number;
  universeId?: number;
  universeRootPlaceId?: number;
  name?: string;
  description?: string;
  url?: string;
  isPlayable?: boolean;
  reasonProhibited?: string;
}[];

/** The subset of `/v1/games/multiget-place-details` a chat game card renders. */
export type TGamePlaceDetails = {
  placeId: number;
  universeId?: number;
  rootPlaceId?: number;
  name?: string;
  description?: string;
  url?: string;
  isPlayable?: boolean;
  reasonProhibited?: string;
};

/**
 * Fetch place details for a chat game-link card via `/v1/games/multiget-place-details`. Cached per
 * placeId; returns null when the place has no details (invalid/moderated link → card falls back to
 * text).
 */
export const useGamePlaceDetails = (placeId: string) => {
  return useQuery<TGamePlaceDetails | null>({
    queryKey: chatQueryKeys.gamePlaceDetails(placeId),
    queryFn: async () => {
      const numericPlaceId = Number(placeId);
      const data = await chatHttpTransport.get<TPlaceDetailsResponse>(
        {
          url: `${environmentUrls.gamesApi}/v1/games/multiget-place-details`,
          withCredentials: true,
        },
        { placeIds: numericPlaceId },
      );
      const detail = data[0];
      if (!detail) {
        return null;
      }
      return {
        placeId: detail.placeId ?? numericPlaceId,
        universeId: detail.universeId,
        rootPlaceId: detail.universeRootPlaceId ?? detail.placeId,
        name: detail.name,
        description: detail.description,
        url: detail.url,
        isPlayable: detail.isPlayable,
        reasonProhibited: detail.reasonProhibited,
      };
    },
    enabled: placeId.length > 0,
    staleTime: Infinity,
  });
};

export default useGamePlaceDetails;
