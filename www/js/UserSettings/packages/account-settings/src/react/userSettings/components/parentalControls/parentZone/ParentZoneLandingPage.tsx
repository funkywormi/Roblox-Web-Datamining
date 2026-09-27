import React from "react";
import ChildDashboardLandingPage from "../childDashboard/ChildDashboardLandingPage";
import OdpAccountUpgradeBanner from "./OdpAccountUpgradeBanner";
import OdpParentInsights from "./OdpParentInsights";
import { useGetOdpChildContextQuery } from "../../../../apis/parentalControlsApi";

// Main landing page for when ODP is launched
// Contains components for the ODP account upgrade banner, linked parent list, PIN management, insights, and settings you manage
// Shows different components based on child's linked ODP/remote parent status
export const ParentZoneLandingPage = (): JSX.Element => {
  const { data: odpChildContext } = useGetOdpChildContextQuery();

  return (
    <React.Fragment>
      {odpChildContext?.eligibleForAccountUpgradeUpsell === true && <OdpAccountUpgradeBanner />}
      <ChildDashboardLandingPage />
      <OdpParentInsights />

      {/* TODO FAMEX-174: Add settings you manage */}
    </React.Fragment>
  );
};

export default ParentZoneLandingPage;
