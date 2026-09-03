import { useCallback } from "react";
import { startDesktopAndMobileWebChat } from "@rbx/core-scripts/util/chat";
import { useSystemFeedback } from "@rbx/core-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { useProfilePlatformContext } from "../../context/ProfilePlatformContext";
import type { ActionHookResult } from "../../types/actionHookTypes";

const useChat = (): ActionHookResult => {
  const { profileData } = useProfilePlatformContext();
  const { systemFeedbackService } = useSystemFeedback();
  const { translate } = useTranslation();

  const handler = useCallback(() => {
    if (!profileData?.profileId) {
      systemFeedbackService.warning(translate("Message.UserDoesNotExist"));
      return;
    }

    try {
      const userId = parseInt(profileData.profileId, 10);
      startDesktopAndMobileWebChat({ userId });
      setTimeout(() => {
        // sometimes chat doesn't work on first try, so we try again
        startDesktopAndMobileWebChat({ userId });
      }, 1000);
    } catch (_) {
      systemFeedbackService.warning(translate("Error.FailedToStartChat"));
    }
  }, [profileData?.profileId, systemFeedbackService, translate]);

  return { handler };
};

export default useChat;
