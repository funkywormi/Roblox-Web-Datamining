import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cloneDeep, isEqual } from "lodash";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { getDeviceMeta, DeviceTypes } from "@rbx/core-scripts/meta/device";
import bedev1Services from "../../common/services/bedev1Services";
import bedev2Services from "../../common/services/bedev2Services";
import { TGetFriendsResponse } from "../../common/types/bedev1Types";
import {
  getInGameFriendsByUniverseIdFromFriendDetails,
  isPresenceUpdateEvent,
} from "../utils/presenceDataUtils";
import {
  TSduiInGameFriendsByUniverseId,
  TSduiPageContext,
  TSduiSocialData,
} from "../system/SduiTypes";
import logSduiError, { SduiErrorNames } from "../utils/logSduiError";

/**
 * Returns the in-game friends by universe ID for the current user.
 *
 * Fetches the profile details for each friend once, and then updates only
 * the presence status for each friend when a presence update event is received.
 */
const useSduiSocialData = (pageContext: TSduiPageContext): TSduiSocialData => {
  const [inGameFriendsByUniverseId, setInGameFriendsByUniverseId] =
    useState<TSduiInGameFriendsByUniverseId>({});

  const friendsDetailsRef = useRef<Record<number, TGetFriendsResponse>>({});

  const onPresenceUpdate = useCallback(
    (event: Event): void => {
      if (!isPresenceUpdateEvent(event) || !event.detail || !friendsDetailsRef.current) {
        logSduiError(
          SduiErrorNames.InvalidPresenceUpdateEvent,
          `Invalid presence update event, event is ${JSON.stringify(
            event,
          )} and friends details are ${JSON.stringify(friendsDetailsRef.current)}`,
          pageContext,
        );

        return;
      }

      const updatedFriendDetails = cloneDeep(friendsDetailsRef.current);

      // Update presence status for each friend in the current friendDetails
      event.detail.forEach(presenceData => {
        if (updatedFriendDetails[presenceData.userId]) {
          updatedFriendDetails[presenceData.userId] = {
            ...updatedFriendDetails[presenceData.userId]!,
            presence: presenceData,
          };
        }
      });

      friendsDetailsRef.current = updatedFriendDetails;

      const updatedInGameFriendsByUniverseId =
        getInGameFriendsByUniverseIdFromFriendDetails(updatedFriendDetails);

      // Only update state if the inGameFriendsByUniverseId data has changed
      setInGameFriendsByUniverseId(prevInGameFriendsByUniverseId => {
        if (!isEqual(updatedInGameFriendsByUniverseId, prevInGameFriendsByUniverseId)) {
          return updatedInGameFriendsByUniverseId;
        }

        return prevInGameFriendsByUniverseId;
      });
    },
    [friendsDetailsRef, pageContext],
  );

  // Perform initial fetch of friend details, and set initial presence state
  useEffect(() => {
    // Do not fetch active friends for non-computer or unauthenticated users
    const deviceMeta = getDeviceMeta();
    if (deviceMeta?.deviceType !== DeviceTypes.computer || !authenticatedUser()?.isAuthenticated) {
      return undefined;
    }

    const getFriendDetails = async (): Promise<void> => {
      try {
        const friendsResponse = await bedev1Services.getFriendsPresence();
        const friendsData = friendsResponse.userData || [];

        const friendIds = friendsData.map(friend => friend.id);

        if (!friendIds) {
          return;
        }

        const profileResponse = await bedev2Services.getProfiles(friendIds);
        const profileDetails = profileResponse.profileDetails || [];

        // Update displayName and name for each friend
        const friendDetails = friendsData.reduce<Record<number, TGetFriendsResponse>>(
          (acc, friend) => {
            const profile = profileDetails.find(p => p.userId === friend.id);
            if (profile && profile.names) {
              acc[friend.id] = {
                ...friend,
                displayName: profile.names.combinedName,
                name: profile.names.username,
              };
            }
            return acc;
          },
          {},
        );

        friendsDetailsRef.current = friendDetails;

        const initialInGameFriendsByUniverseId =
          getInGameFriendsByUniverseIdFromFriendDetails(friendDetails);

        setInGameFriendsByUniverseId(initialInGameFriendsByUniverseId);

        document.addEventListener("Roblox.Presence.Update", onPresenceUpdate);
      } catch (e) {
        logSduiError(
          SduiErrorNames.FriendsPresenceFetchFailure,
          `Failed to get friends details info, error is ${JSON.stringify(e)}`,
          pageContext,
        );
      }
    };

    getFriendDetails().catch(() => {
      // Failures are handled internally by getFriendDetails
    });

    return () => {
      document.removeEventListener("Roblox.Presence.Update", onPresenceUpdate);
    };
  }, [onPresenceUpdate, pageContext]);

  return useMemo(() => {
    return {
      inGameFriendsByUniverseId,
    };
  }, [inGameFriendsByUniverseId]);
};

export default useSduiSocialData;
