import { useTranslation } from "react-utilities";
import { List, ListItem, ListItemChevronTrailingAccessory } from "@rbx/foundation-ui";
import SettingsSection from "../../../../common/components/SettingsSection";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import useManageParentPin, { ManageParentPinAction } from "../../../hooks/useManageParentPin";

// Page for on-device parents to manage their parent PIN and odp > remote account upgrade requests
export const ManageOnDeviceParentPage = (): JSX.Element => {
  const { translate } = useTranslation();
  const manageParentPin = useManageParentPin();

  const { parentPinManagement } = parentalControlsTranslationConstants;

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
          divider="None"
          title={translate(parentPinManagement.removePinAction)}
          trailing={<ListItemChevronTrailingAccessory />}
          onSelect={() => manageParentPin(ManageParentPinAction.Delete)}
        />
        {/* TODO FAMEX-176: Add ODP upgrade request management */}
      </List>
    </SettingsSection>
  );
};

export default ManageOnDeviceParentPage;
