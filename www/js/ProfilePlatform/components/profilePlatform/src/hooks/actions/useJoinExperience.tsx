import { useCallback } from "react";
import { useSystemFeedback } from "@rbx/core-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { GameLauncher } from "@rbx/core-scripts/legacy/Roblox";
import { useProfilePlatformContext } from "../../context/ProfilePlatformContext";
import type { ActionHookResult } from "../../types/actionHookTypes";

interface PresenceData {
  userPresenceType: number;
  gameId?: string;
  rootPlaceId: number | null;
}

interface PresenceService {
  usePresence: (userId: number, options?: unknown) => PresenceData;
}

declare const RobloxPresence: PresenceService;

const useJoinExperience = (): ActionHookResult => {
  const { profileData } = useProfilePlatformContext();
  const { systemFeedbackService } = useSystemFeedback();
  const { translate } = useTranslation();
  const presence = RobloxPresence.usePresence(
    parseInt(profileData?.profileId ?? "0", 10),
    undefined,
  );

  // TODO: SOCI-2583 (use standard join)
  const handler = useCallback(() => {
    if (!profileData?.profileId) {
      systemFeedbackService.warning(translate("Message.UserDoesNotExist"));
      return;
    }

    const joinAttemptId = presence.gameId ?? "";
    const deviceMeta = getDeviceMeta();
    if (deviceMeta?.isInApp) {
      if (deviceMeta.isDesktop && GameLauncher) {
        GameLauncher.followPlayerIntoGame(
          parseInt(profileData.profileId, 10),
          joinAttemptId,
          "JoinUser",
        );
      } else {
        window.location.href = `/games/start?userID=${profileData.profileId}&joinAttemptId=${joinAttemptId}&joinAttemptOrigin=JoinUser`;
      }
    } else if (deviceMeta?.isAndroidDevice || deviceMeta?.isChromeOs) {
      window.location.href = `intent://userId=${profileData.profileId}&joinAttemptId=${joinAttemptId}&joinAttemptOrigin=JoinUser#Intent;scheme=robloxmobile;package=com.roblox.client;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.roblox.client;end`;
    } else if (deviceMeta?.isIosDevice) {
      window.location.href = `robloxmobile://userId=${profileData.profileId}&joinAttemptId=${joinAttemptId}&joinAttemptOrigin=JoinUser`;
    } else {
      // Use global ProtocolHandlerClientInterface
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-unsafe-member-access
      const protocolHandler = (window as any).Roblox?.ProtocolHandlerClientInterface;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (protocolHandler?.followPlayerIntoGame) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        protocolHandler
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          .followPlayerIntoGame({
            userId: parseInt(profileData.profileId, 10),
            joinAttemptId,
            joinAttemptOrigin: "JoinUser",
          })
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          .catch(() => {
            systemFeedbackService.warning(translate("Error.FailedToJoinExperience"));
          });
      } else {
        // Fallback to games start page
        window.location.href = `/games/start?userID=${profileData.profileId}&joinAttemptId=${joinAttemptId}&joinAttemptOrigin=JoinUser`;
      }
    }
  }, [presence.gameId, profileData?.profileId, systemFeedbackService, translate]);

  return { handler };
};

export default useJoinExperience;
