import { useCallback, useEffect, useRef, useState } from "react";
import {
  Action,
  Component,
  fetchProfilePlatform,
  ProfilePlatformResponse,
  ProfileType,
} from "@rbx/profile-platform";

type ProfileActions = ProfilePlatformResponse["components"]["Actions"];

export type UseFetchProfileActionsResponse = {
  actions: ProfileActions;
  isActionsLoaded: boolean;
  hasActionsError: boolean;
  refreshActions: () => Promise<void>;
};

/**
 * Fetches only the Actions component once the Actions V2 experiment value is known.
 * Does nothing while `isActionsV2Enabled` is undefined.
 */
const useFetchProfileActions = (
  profileId: string,
  profileType: ProfileType,
  supportedActions: Action[],
  isActionsV2Enabled: boolean | undefined,
): UseFetchProfileActionsResponse => {
  const [actions, setActions] = useState<ProfileActions>();
  const [isActionsLoaded, setIsActionsLoaded] = useState(false);
  const [hasActionsError, setHasActionsError] = useState(false);
  const latestRequestId = useRef(0);

  const refreshActions = useCallback(async () => {
    if (isActionsV2Enabled === undefined) {
      return;
    }

    latestRequestId.current += 1;
    const requestId = latestRequestId.current;

    try {
      const response = await fetchProfilePlatform({
        profileId,
        profileType,
        components: [
          {
            component: Component.Actions,
            supportedActions,
            isActionsV2Supported: isActionsV2Enabled,
          },
        ],
      });
      if (requestId !== latestRequestId.current) {
        return;
      }
      setActions(response.components.Actions);
      setHasActionsError(false);
    } catch {
      if (requestId !== latestRequestId.current) {
        return;
      }
      setHasActionsError(true);
    } finally {
      if (requestId === latestRequestId.current) {
        setIsActionsLoaded(true);
      }
    }
  }, [profileId, profileType, supportedActions, isActionsV2Enabled]);

  useEffect(() => {
    setActions(undefined);
    setIsActionsLoaded(false);
    setHasActionsError(false);
    refreshActions().catch(() => undefined);

    return () => {
      // Invalidate any in-flight request when the inputs change or the component unmounts.
      latestRequestId.current += 1;
    };
  }, [refreshActions]);

  return { actions, isActionsLoaded, hasActionsError, refreshActions };
};

export default useFetchProfileActions;
