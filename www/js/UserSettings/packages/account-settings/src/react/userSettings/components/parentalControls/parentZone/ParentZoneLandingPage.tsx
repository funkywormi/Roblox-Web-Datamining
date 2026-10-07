import React from "react";
import ChildDashboardLandingPage from "../childDashboard/ChildDashboardLandingPage";
import OdpAccountUpgradeBanner from "./OdpAccountUpgradeBanner";
import OdpParentInsights from "./OdpParentInsights";
import OdpSettingManagement from "./OdpSettingManagement";
import OdpRobuxSection from "./OdpRobuxSection";
import { useGetOdpChildContextQuery } from "../../../../apis/parentalControlsApi";

// Main landing page for when ODP is launched
// Contains components for the ODP account upgrade banner, linked parent list, PIN management, insights, and settings management
// Shows different components based on child's linked ODP/remote parent status
export const ParentZoneLandingPage = (): JSX.Element => {
  const { data: odpChildContext } = useGetOdpChildContextQuery();

  return (
    <React.Fragment>
      {odpChildContext?.eligibleForAccountUpgradeUpsell === true && <OdpAccountUpgradeBanner />}
      <ChildDashboardLandingPage />
      <OdpRobuxSection />
      <OdpParentInsights />

      <OdpSettingManagement />
    </React.Fragment>
  );
};

export default ParentZoneLandingPage;
