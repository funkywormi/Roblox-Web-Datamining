import { useEffect, useMemo, useState } from "react";
import { TGameData } from "../types/bedev1Types";
import bedev1Services from "../services/bedev1Services";

export default function useReferralPlaceId(
  gameData: TGameData,
  navigationRootPlaceId?: string,
): number {
  const [navigationOverridePlaceId, setNavigationOverridePlaceId] = useState<number | undefined>(
    () => {
      return navigationRootPlaceId && !isNaN(Number(navigationRootPlaceId))
        ? parseInt(navigationRootPlaceId, 10)
        : undefined;
    },
  );

  useEffect(() => {
    if (gameData.navigationUid) {
      // Fetch the place ID to navigate to for this universe ID
      bedev1Services
        .getGameDetails(gameData.navigationUid)
        .then(data => {
          if (data?.rootPlaceId) {
            setNavigationOverridePlaceId(data.rootPlaceId);
          }
        })
        .catch(() => {
          // non-blocking, as we will fallback to gameData.placeId
        });
    }
  }, [gameData.navigationUid]);

  return useMemo(() => {
    if (navigationOverridePlaceId) {
      return navigationOverridePlaceId;
    }
    if (gameData.placeIdOverride) {
      return gameData.placeIdOverride;
    }
    return gameData.placeId;
  }, [navigationOverridePlaceId, gameData.placeIdOverride, gameData.placeId]);
}
