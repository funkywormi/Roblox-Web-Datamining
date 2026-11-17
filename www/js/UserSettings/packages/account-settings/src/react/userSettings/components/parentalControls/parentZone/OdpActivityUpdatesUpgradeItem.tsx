import { useTranslation } from "react-utilities";
import { Button } from "@rbx/foundation-ui";
import { SettingControlItem } from "@rbx/user-settings";
import ParentalControlsPageName from "../../../../../enums/parentalControls/ParentalControlsPageName";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import useOdpAccountUpgrade, { OdpAccountUpgradeAction } from "../../../hooks/useOdpAccountUpgrade";
import { btnClickOdpActivityUpdatesCreateAccount } from "../../../services/eventServices/odpFamilyEventService";
import { useGetParentInfoQuery } from "../../../../apis/parentalControlsApi";

// Not set on the button, so the label doesn't replace the button's own accessible name
const ACTIVITY_UPDATES_UPGRADE_ITEM_ID = "odp-activity-updates-upgrade";

// Activity updates are remote-parent only, so an ODP is prompted to upgrade instead of a toggle
export const OdpActivityUpdatesUpgradeItem = (): JSX.Element => {
  const { translate } = useTranslation();
  const startAccountUpgrade = useOdpAccountUpgrade();
  const { data: parentInfo } = useGetParentInfoQuery();

  const { pageTitles, activityUpdates } = parentalControlsTranslationConstants;

  return (
    <SettingControlItem
      id={ACTIVITY_UPDATES_UPGRADE_ITEM_ID}
      label={translate(pageTitles[ParentalControlsPageName.ActivityUpdates])}
      description={translate(activityUpdates.upgradeUpsellDescription)}
      control={
        <Button
          variant="Emphasis"
          size="Small"
          onClick={() => {
            btnClickOdpActivityUpdatesCreateAccount(parentInfo?.parents);
            startAccountUpgrade(OdpAccountUpgradeAction.Create);
          }}
        >
          {translate(activityUpdates.upgradeUpsellAction)}
        </Button>
      }
    />
  );
};

export default OdpActivityUpdatesUpgradeItem;
