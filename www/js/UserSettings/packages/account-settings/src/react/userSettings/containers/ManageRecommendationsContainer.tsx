import React from "react";
import { useGetSettingsUiPolicyQuery } from "../../apis/universalAppConfigurationApi";

const MANAGE_RECOMMENDATIONS_PLACEHOLDER =
  "This will be the content preferences page once the API is stood up.";

/**
 * Manage Recommendations page (ANC-99), at `/my/account#!/personalized-recommendations`.
 *
 * The tab is removed when `displayManageRecommendationsTab` is off, but tabs mount before the
 * policy loads, so this also waits for the policy before rendering anything.
 */
const ManageRecommendationsContainer = (): JSX.Element | null => {
  const { data: settingsUiPolicy } = useGetSettingsUiPolicyQuery();

  if (!settingsUiPolicy?.displayManageRecommendationsTab) {
    return null;
  }

  // Temporary placeholder until the settings surface API is up (ANC-102/104). ANC-118 replaces it
  // with the surface returned by SettingsSurfaceQuery, so the copy is intentionally untranslated.
  return (
    <section className="settings-container-v2" data-testid="manage-recommendations-page">
      <p
        className="stroke-standard stroke-default radius-large padding-large margin-[0] text-body-medium content-default"
        data-testid="manage-recommendations-placeholder"
      >
        {MANAGE_RECOMMENDATIONS_PLACEHOLDER}
      </p>
    </section>
  );
};

export default ManageRecommendationsContainer;
