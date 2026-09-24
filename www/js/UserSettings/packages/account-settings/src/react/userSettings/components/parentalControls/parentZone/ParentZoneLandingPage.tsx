import React from "react";
import ChildDashboardLandingPage from "../childDashboard/ChildDashboardLandingPage";
import OdpAccountUpgradeBanner from "./OdpAccountUpgradeBanner";
import { useGetOdpChildContextQuery } from "../../../../apis/parentalControlsApi";

export const ParentZoneLandingPage = (): JSX.Element => {
  const { data: odpChildContext } = useGetOdpChildContextQuery();

  return (
    <React.Fragment>
      {odpChildContext?.eligibleForAccountUpgradeUpsell === true && <OdpAccountUpgradeBanner />}
      <ChildDashboardLandingPage />

      {/* TODO FAMEX-173/174: Add insights and settings you manage */}
    </React.Fragment>
  );
};

export default ParentZoneLandingPage;
