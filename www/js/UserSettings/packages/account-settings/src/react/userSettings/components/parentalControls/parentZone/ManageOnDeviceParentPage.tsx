import { useTranslation } from "react-utilities";
import { List, ListItem, ListItemChevronTrailingAccessory } from "@rbx/foundation-ui";
import SettingsSection from "../../../../common/components/SettingsSection";
import { useGetOdpChildContextQuery } from "../../../../apis/parentalControlsApi";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import useManageParentPin, { ManageParentPinAction } from "../../../hooks/useManageParentPin";
import useOdpAccountUpgrade, { OdpAccountUpgradeAction } from "../../../hooks/useOdpAccountUpgrade";

// Page for on-device parents to manage their parent PIN and odp > remote account upgrade requests
export const ManageOnDeviceParentPage = (): JSX.Element => {
  const { translate } = useTranslation();
  const manageParentPin = useManageParentPin();
  const startAccountUpgrade = useOdpAccountUpgrade();
  const { data: odpChildContext } = useGetOdpChildContextQuery();

  const { parentPinManagement, odpAccountUpgrade } = parentalControlsTranslationConstants;

  const canUpgradeAccount = odpChildContext?.eligibleForStandaloneAccountUpgrade === true;
  const canUpdateEmailOnUpgradeRequest =
    !canUpgradeAccount && odpChildContext?.eligibleForUpdateAccountUpgradeEmail === true;

  return (
    <SettingsSection>
      <List className="bg-shift-100 stroke-standard stroke-default radius-large clip">
        <ListItem
          isContained={false}
          size="Medium"
          divider="Full"
          title={translate(parentPinManagement.updatePinAction)}
          trailing={<ListItemChevronTrailingAccessory />}
          onSelect={() => manageParentPin(ManageParentPinAction.Update)}
        />
        <ListItem
          isContained={false}
          size="Medium"
          divider={canUpgradeAccount || canUpdateEmailOnUpgradeRequest ? "Full" : "None"}
          title={translate(parentPinManagement.removePinAction)}
          trailing={<ListItemChevronTrailingAccessory />}
          onSelect={() => manageParentPin(ManageParentPinAction.Delete)}
        />
        {canUpgradeAccount && (
          <ListItem
            isContained={false}
            size="Medium"
            divider="None"
            title={translate(odpAccountUpgrade.createAccountAction)}
            description={translate(odpAccountUpgrade.createAccountDescription)}
            trailing={<ListItemChevronTrailingAccessory />}
            onSelect={() => startAccountUpgrade(OdpAccountUpgradeAction.Create)}
          />
        )}
        {canUpdateEmailOnUpgradeRequest && (
          <ListItem
            isContained={false}
            size="Medium"
            divider="None"
            title={translate(odpAccountUpgrade.updateEmailAction)}
            metadata={odpChildContext?.pendingAccountUpgradeEmail}
            trailing={<ListItemChevronTrailingAccessory />}
            onSelect={() => startAccountUpgrade(OdpAccountUpgradeAction.Update)}
          />
        )}
      </List>
    </SettingsSection>
  );
};

export default ManageOnDeviceParentPage;
