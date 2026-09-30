import React from "react";
import { useGetOdpChildContextQuery } from "../../../../apis/parentalControlsApi";
import RobuxBalanceCard from "../shared/RobuxBalanceCard";

// Robux balance for on-device parent zone.
export const OdpRobuxSection = (): React.JSX.Element | null => {
  const { data: odpChildContext } = useGetOdpChildContextQuery();

  const { robuxBalance } = odpChildContext ?? {};

  if (robuxBalance === undefined) {
    return null;
  }

  return (
    <React.Fragment>
      <div className="rbx-divider" />
      {/* TODO FAMEX-227: link to the Robux transfer limit settings page from the Manage button in the preview card */}
      {/* TODO FAMEX-235: confirm with product whether ODP can gift robux */}
      <RobuxBalanceCard robuxBalance={robuxBalance} />
    </React.Fragment>
  );
};

export default OdpRobuxSection;
