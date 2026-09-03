import { useCallback, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import playButtonService from "../services/playButtonService";
import playButtonConstants from "../constants/playButtonConstants";
import { PlayabilityStatus } from "../constants/playabilityStatus";
import {
  TGetPlayabilityStatus,
  TPlayabilityStatus,
  TPlayableUxTreatment,
  TUpsellUxTreatment,
} from "../types/playButtonTypes";

const { counterEvents } = playButtonConstants;

export const PLAYABILITY_QUERY_KEY = "playabilityStatus";
const STALE_TIME_MS = 30000; // 30 seconds

type TPlayabilityData = {
  playabilityStatus: TPlayabilityStatus;
  isPlayable: boolean | undefined;
  unplayableDisplayText: string | undefined | null;
  playableUxTreatment: TPlayableUxTreatment | undefined;
  upsellUxTreatment: TUpsellUxTreatment | undefined;
};

const failedPlayabilityData: TPlayabilityData = {
  playabilityStatus: PlayabilityStatus.TemporarilyUnavailable,
  isPlayable: undefined,
  unplayableDisplayText: undefined,
  playableUxTreatment: undefined,
  upsellUxTreatment: undefined,
};

/**
 * Fetches and manages the playability status for a given universe.
 *
 * Uses react-query for caching, so multiple components using the same
 * universeId will share a single request instead of duplicating fetches.
 *
 * Automatically fetches on mount and when `universeId` changes.
 * Also refetches when the page is restored from the back-forward cache.
 *
 * @param universeId - The universe ID to check playability for
 * @returns An object containing:
 *   - `playabilityStatus` - The current playability status (undefined while loading)
 *   - `isPlayable` - Whether the experience is playable (undefined while loading or on error)
 *   - `unplayableDisplayText` - Optional user-facing message explaining why the experience is unplayable
 *   - `upsellUxTreatment` - Optional contextual upsell to surface for this experience (e.g. ageCheckUpsell)
 *   - `isFetchingPlayability` - Whether a fetch is currently in progress
 *   - `refetchPlayabilityData` - Function to manually trigger a refetch
 */
export const usePlayabilityStatus = (
  universeId: string,
): {
  playabilityStatus: TPlayabilityStatus | undefined;
  isPlayable: boolean | undefined;
  unplayableDisplayText: string | undefined | null;
  playableUxTreatment: TPlayableUxTreatment | undefined;
  upsellUxTreatment: TUpsellUxTreatment | undefined;
  isFetchingPlayability: boolean;
  refetchPlayabilityData: () => void;
} => {
  const { data, isFetching, isError, refetch } = useQuery<TPlayabilityData>({
    queryKey: [PLAYABILITY_QUERY_KEY, universeId],
    queryFn: async () => {
      if (!universeId) {
        window.EventTracker?.fireEvent(counterEvents.PlayabilityStatusFetchInvalidUniverseId);
        throw new Error("Invalid universe ID for playability status fetch");
      }

      let response: TGetPlayabilityStatus | undefined;
      try {
        response = await playButtonService.getPlayabilityStatus([universeId]);
      } catch {
        window.EventTracker?.fireEvent(counterEvents.PlayabilityStatusFetchFailed);
        throw new Error("Playability status fetch failed");
      }

      // Runtime validation of the API response
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!response?.playabilityStatus || response.isPlayable === undefined) {
        window.EventTracker?.fireEvent(counterEvents.PlayabilityStatusFetchInvalidResponse);
        throw new Error("Invalid playability status response");
      }

      return {
        playabilityStatus: response.playabilityStatus,
        isPlayable: response.isPlayable,
        unplayableDisplayText: response.unplayableDisplayText,
        playableUxTreatment: response.playableUxTreatment,
        upsellUxTreatment: response.upsellUxTreatment,
      };
    },
    staleTime: STALE_TIME_MS,
  });

  const refetchPlayabilityData = useCallback(() => {
    // eslint-disable-next-line no-void
    void refetch();
  }, [refetch]);

  // Refetch playability when the page is shown from the back-forward cache
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        refetchPlayabilityData();
      }
    };

    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [refetchPlayabilityData]);

  return useMemo(() => {
    if (isError) {
      return {
        playabilityStatus: failedPlayabilityData.playabilityStatus,
        isPlayable: failedPlayabilityData.isPlayable,
        unplayableDisplayText: failedPlayabilityData.unplayableDisplayText,
        playableUxTreatment: failedPlayabilityData.playableUxTreatment,
        upsellUxTreatment: failedPlayabilityData.upsellUxTreatment,
        isFetchingPlayability: isFetching,
        refetchPlayabilityData,
      };
    }

    return {
      playabilityStatus: data?.playabilityStatus,
      isPlayable: data?.isPlayable,
      unplayableDisplayText: data?.unplayableDisplayText,
      playableUxTreatment: data?.playableUxTreatment,
      upsellUxTreatment: data?.upsellUxTreatment,
      isFetchingPlayability: isFetching,
      refetchPlayabilityData,
    };
  }, [data, isError, isFetching, refetchPlayabilityData]);
};

export default usePlayabilityStatus;
