import { useEffect, useState } from "react";
import bedev1Services from "../services/bedev1Services";

export default function usePlaceIdOverride(
  placeIdOverride: number | undefined,
  universeId: string,
): { validatedPlaceIdOverride: number | null; isResolvingPlaceId: boolean } {
  const [validatedPlaceIdOverride, setValidatedPlaceIdOverride] = useState<number | null>(null);
  const [isResolvingPlaceId, setIsResolvingPlaceId] = useState(!!placeIdOverride);

  useEffect(() => {
    if (placeIdOverride == null || isNaN(Number(placeIdOverride)) || !universeId) {
      setValidatedPlaceIdOverride(null);
      setIsResolvingPlaceId(false);
      return;
    }
    setIsResolvingPlaceId(true);
    bedev1Services
      .getPlaceDetails(String(placeIdOverride))
      .then(placeDetails => {
        if (placeDetails?.universeId != null && String(placeDetails.universeId) === universeId) {
          setValidatedPlaceIdOverride(placeIdOverride);
        } else {
          setValidatedPlaceIdOverride(null);
        }
      })
      .catch(() => setValidatedPlaceIdOverride(null))
      .finally(() => setIsResolvingPlaceId(false));
  }, [placeIdOverride, universeId]);

  return { validatedPlaceIdOverride, isResolvingPlaceId };
}
