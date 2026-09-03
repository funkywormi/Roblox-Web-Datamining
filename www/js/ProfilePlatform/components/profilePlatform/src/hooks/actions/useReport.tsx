import { useCallback, useState } from "react";
import { AbuseReportDialog, prefetchAbuseUI } from "@rbx/abuse-report-ui";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { useSystemFeedback } from "@rbx/core-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { useProfilePlatformContext } from "../../context/ProfilePlatformContext";
import type { ActionHookResult } from "../../types/actionHookTypes";

const useReport = (): ActionHookResult => {
  const { profileData, refreshProfilePlatform } = useProfilePlatformContext();
  const { systemFeedbackService } = useSystemFeedback();
  const { translate } = useTranslation();
  const profileId = profileData?.profileId;
  const authenticatedUserId = authenticatedUser()?.id;
  const [showAbuseReportDialog, setShowAbuseReportDialog] = useState(false);

  const handler = useCallback(() => {
    if (!profileId) {
      systemFeedbackService.warning(translate("Message.UserDoesNotExist"));
      return;
    }
    if (!authenticatedUserId) {
      window.location.href = "https://help.roblox.com/hc/articles/203312410";
      return;
    }
    setShowAbuseReportDialog(true);
  }, [profileId, authenticatedUserId, systemFeedbackService, translate]);

  const Component = () => {
    if (!profileId) {
      return null;
    }

    return (
      <AbuseReportDialog
        abuseVector="user_profile"
        targetIdStr={profileId}
        open={showAbuseReportDialog}
        onClose={() => {
          setShowAbuseReportDialog(false);
          // Reporter might have blocked the user during the reporting flow.
          refreshProfilePlatform().catch((error: unknown) => {
            console.error(error);
          });
        }}
      />
    );
  };

  const willPopoverOpen = useCallback(() => {
    if (profileId) {
      prefetchAbuseUI({ abuseVector: "user_profile", targetIdStr: profileId });
    }
  }, [profileId]);

  return { handler, Component, willPopoverOpen };
};

export default useReport;
