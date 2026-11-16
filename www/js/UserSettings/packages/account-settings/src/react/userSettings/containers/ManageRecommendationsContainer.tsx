import { useEffect } from "react";
import { getCurrentUser } from "@rbx/www-common/user";
import { useGetSettingsUiPolicyQuery } from "../../apis/universalAppConfigurationApi";
import ManageRecommendationsLoader from "../components/manageRecommendations/ManageRecommendationsLoader";
import { manageRecommendationsSurfaceKey } from "../components/manageRecommendations/ManageRecommendationsPage";
import { SettingsSurfaceError } from "../../settingsSurface/SettingsSurfaceError";
import reloadUtils from "../utils/reloadUtils";
import { fireSettingsSurfaceIssueCounter } from "../components/manageRecommendations/manageRecommendationsCounters";

/**
 * Manage Recommendations page (ANC-99), at `/my/account#!/personalized-recommendations`.
 *
 * The tab is removed when `displayManageRecommendationsTab` is off, but tabs mount before the
 * policy loads, so this also waits for the policy before loading anything.
 */
const ManageRecommendationsContainer = (): React.JSX.Element | null => {
  const { data: settingsUiPolicy } = useGetSettingsUiPolicyQuery();
  const isEnabled = Boolean(settingsUiPolicy?.displayManageRecommendationsTab);
  const userId = getCurrentUser()?.id;

  useEffect(() => {
    if (isEnabled && !userId) {
      fireSettingsSurfaceIssueCounter(manageRecommendationsSurfaceKey, "LoadFailed", "NoUser");
    }
  }, [isEnabled, userId]);

  if (!isEnabled) {
    return null;
  }
  if (!userId) {
    return (
      <SettingsSurfaceError
        className="settings-container-v2 padding-bottom-large"
        onRetry={reloadUtils.reloadPage}
      />
    );
  }

  return (
    <ManageRecommendationsLoader surfaceKey={manageRecommendationsSurfaceKey} userId={userId} />
  );
};

export default ManageRecommendationsContainer;
