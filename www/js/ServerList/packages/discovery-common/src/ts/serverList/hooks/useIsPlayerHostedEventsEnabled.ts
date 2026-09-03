import { useEffect, useRef } from "react";
import ExperimentationService from "@rbx/experimentation";
import useExperimentValues from "../../common/hooks/useExperimentValues";
import useUniversePlayerHostingPolicy from "./useUniversePlayerHostingPolicy";
import {
  playerHostedEventsExperimentLayer,
  isPlayerHostedEventsEnabledParam,
} from "../constants/experimentConstants";

type PlayerHostedEventsExperimentValues = {
  [isPlayerHostedEventsEnabledParam]: boolean;
};

// Module-level constant so the reference is stable across renders (the default
// values feed a useMemo dependency in useExperimentValues).
const defaultValues: PlayerHostedEventsExperimentValues = {
  [isPlayerHostedEventsEnabledParam]: false,
};

/**
 * Gates the "Create a player hosted event" row for a universe: it renders only
 * when the universe's hosting policy is enabled and the IXP flag is on. Both
 * default to disabled while loading or on error, so the row stays hidden until
 * we positively know it should show.
 *
 * Exposure is logged once, and only for universes that are actually eligible to
 * host, so the experiment population stays limited to users who could see the
 * row.
 */
const useIsPlayerHostedEventsEnabled = (
  universeId: number | undefined,
): { isPlayerHostedEventsEnabled: boolean } => {
  const { isHostingEnabled } = useUniversePlayerHostingPolicy(universeId);

  const { ixpData, isLoading } = useExperimentValues<PlayerHostedEventsExperimentValues>(
    playerHostedEventsExperimentLayer,
    defaultValues,
  );

  const hasLoggedExposure = useRef(false);
  useEffect(() => {
    if (isHostingEnabled && !isLoading && !hasLoggedExposure.current) {
      hasLoggedExposure.current = true;
      try {
        ExperimentationService.logLayerExposure(playerHostedEventsExperimentLayer);
      } catch {
        // Exposure logging is best-effort and must never block rendering.
      }
    }
  }, [isHostingEnabled, isLoading]);

  return {
    isPlayerHostedEventsEnabled: isHostingEnabled && ixpData[isPlayerHostedEventsEnabledParam],
  };
};

export default useIsPlayerHostedEventsEnabled;
