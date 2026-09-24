import { useTranslation } from "react-utilities";
import { Banner, Button } from "@rbx/foundation-ui";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import useOdpAccountUpgrade from "../../../hooks/useOdpAccountUpgrade";

// Upsell prompting user to upgrade their ODP to a remote parent
export const OdpAccountUpgradeBanner = (): JSX.Element => {
  const { translate } = useTranslation();
  const startAccountUpgrade = useOdpAccountUpgrade();

  const { odpAccountUpgrade } = parentalControlsTranslationConstants;

  return (
    <Banner
      type="Upsell"
      className="[&_div]:max-width-full"
      title={translate(odpAccountUpgrade.heading)}
      description={translate(odpAccountUpgrade.description)}
      actions={
        <Button variant="Emphasis" size="Small" onClick={startAccountUpgrade}>
          {translate(commonTranslationConstants.continue)}
        </Button>
      }
    />
  );
};

export default OdpAccountUpgradeBanner;
