import React from "react";
import { useTranslation } from "react-utilities";
import { Button } from "@rbx/foundation-ui";
import { useGetOdpChildContextQuery } from "../../../../apis/parentalControlsApi";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import { parentZonePages } from "../../../constants/parentalControls/parentZonePages";
import { buyRobuxUrl } from "../../../constants/urlConstants";
import RobuxBalanceCard from "../shared/RobuxBalanceCard";

// Robux balance for on-device parent zone.
export const OdpRobuxSection = (): React.JSX.Element | null => {
  const { translate } = useTranslation();
  const { data: odpChildContext } = useGetOdpChildContextQuery();

  const { robuxBalance } = odpChildContext ?? {};
  const robuxSettingsPath =
    odpChildContext?.canParentManageChildRobuxTransferLimits === true
      ? parentZonePages.robuxPage.path
      : undefined;

  const canAddRobux =
    odpChildContext?.canParentGiftChildRobux === true && robuxBalance !== undefined;

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
        action={
          canAddRobux && (
            <Button as="a" href={buyRobuxUrl} variant="Standard" size="Medium" className="shrink-0">
              {translate(parentalControlsTranslationConstants.giftRobux.addRobuxAction)}
            </Button>
          )
        }
      />
    </React.Fragment>
  );
};

export default OdpRobuxSection;
