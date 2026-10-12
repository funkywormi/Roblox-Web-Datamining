import { useTranslation } from "react-utilities";
import { Banner, Button } from "@rbx/foundation-ui";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import useOdpAccountUpgrade, { OdpAccountUpgradeAction } from "../../../hooks/useOdpAccountUpgrade";
import { btnClickOdpCreateAccount } from "../../../services/eventServices/odpFamilyEventService";
import { useGetParentInfoQuery } from "../../../../apis/parentalControlsApi";

// Upsell prompting user to upgrade their ODP to a remote parent
export const OdpAccountUpgradeBanner = (): JSX.Element => {
  const { translate } = useTranslation();
  const startAccountUpgrade = useOdpAccountUpgrade();
  const { data: parentInfo } = useGetParentInfoQuery();

  const { odpAccountUpgrade } = parentalControlsTranslationConstants;

  return (
    <Banner
      type="Upsell"
      className="[&_div]:max-width-full"
      title={translate(odpAccountUpgrade.heading)}
      description={translate(odpAccountUpgrade.description)}
      actions={
        <Button
          variant="Emphasis"
          size="Small"
          onClick={() => {
            btnClickOdpCreateAccount(parentInfo?.parents);
            startAccountUpgrade(OdpAccountUpgradeAction.Create);
          }}
        >
          {translate(commonTranslationConstants.continue)}
        </Button>
      }
    />
  );
};

export default OdpAccountUpgradeBanner;
