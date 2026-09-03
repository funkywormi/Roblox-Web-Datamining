import { useEffect, useState, useRef } from "react";
import { getDeviceMeta, DeviceTypes } from "@rbx/core-scripts/meta/device";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import bedev1Services from "../services/bedev1Services";
import bedev2Services from "../services/bedev2Services";
import { TGetFriendsResponse, TPresenseUpdateEvent } from "../types/bedev1Types";

export default function (): TGetFriendsResponse[] {
  const [friendsPresenceData, setFriendsPresenceData] = useState<
    Record<number, TGetFriendsResponse>
  >({});
  const friendsPresenceDataRef = useRef<Record<number, TGetFriendsResponse>>(friendsPresenceData);

  const onPresenceUpdate = (event: TPresenseUpdateEvent) => {
    (event.detail || []).forEach(presenceData => {
      if (friendsPresenceDataRef.current[presenceData.userId]) {
        friendsPresenceDataRef.current[presenceData.userId] = {
          ...friendsPresenceDataRef.current[presenceData.userId]!,
          presence: presenceData,
        };
      }
    });
    setFriendsPresenceData({ ...friendsPresenceDataRef.current });
  };

  useEffect(() => {
    const getFriends = async () => {
      const deviceMeta = getDeviceMeta();
      if (deviceMeta?.deviceType === DeviceTypes.computer && authenticatedUser()?.isAuthenticated) {
        try {
          const { userData } = await bedev1Services.getFriendsPresence();
          const friendIds: number[] = userData ? userData.map(friend => friend.id) : [];
          if (friendIds.length === 0) {
            return;
          }

          const { profileDetails } = await bedev2Services.getProfiles(friendIds);

          const parsedPresenseResponse = (userData || []).reduce<
            Record<number, TGetFriendsResponse>
          >((acc, friend) => {
            const foundProfile = profileDetails.find(profile => profile.userId === friend.id);
            if (foundProfile) {
              acc[friend.id] = {
                ...friend,
                displayName: foundProfile.names.combinedName,
                name: foundProfile.names.username,
              };
            }
            return acc;
          }, {});
          friendsPresenceDataRef.current = parsedPresenseResponse;
          setFriendsPresenceData({ ...friendsPresenceDataRef.current });
          document.addEventListener("Roblox.Presence.Update", onPresenceUpdate as EventListener);
        } catch (e) {
          console.error("useFriendsPresence failed to initialized with the error", e);
        }
      }
    };

    // eslint-disable-next-line no-void
    void getFriends();
    return () => {
      document.removeEventListener("Roblox.Presence.Update", onPresenceUpdate as EventListener);
    };
  }, []);

  return Object.values(friendsPresenceData);
}
