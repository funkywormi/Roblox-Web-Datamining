import React from "react";
import { useTranslation } from "react-utilities";
import { useGetOdpChildContextQuery } from "../../../../apis/parentalControlsApi";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import { parentZonePages } from "../../../constants/parentalControls/parentZonePages";
import RobuxBalanceCard from "../shared/RobuxBalanceCard";

// Robux balance for on-device parent zone.
// TODO FAMEX-235: confirm with product whether ODP can gift robux
export const OdpRobuxSection = (): React.JSX.Element | null => {
  const { translate } = useTranslation();
  const { data: odpChildContext } = useGetOdpChildContextQuery();

  const { robuxBalance } = odpChildContext ?? {};
  const robuxSettingsPath =
    odpChildContext?.canParentManageChildRobuxTransferLimits === true
      ? parentZonePages.robuxPage.path
      : undefined;

  // An absent balance means the balance read failed, which the card renders blank. With no balance
  // and no settings to reach, the card would hold nothing, so the section hides instead.
  if (robuxBalance === undefined && robuxSettingsPath === undefined) {
    return null;
  }

  return (
    <React.Fragment>
      <div className="rbx-divider" />
      <RobuxBalanceCard
        robuxBalance={robuxBalance}
        linkText={
          robuxSettingsPath === undefined ? undefined : translate(commonTranslationConstants.manage)
        }
        linkPath={robuxSettingsPath}
      />
    </React.Fragment>
  );
};

export default OdpRobuxSection;
