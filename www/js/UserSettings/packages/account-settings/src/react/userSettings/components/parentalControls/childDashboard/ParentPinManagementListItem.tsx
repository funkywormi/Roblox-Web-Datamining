import { useHistory } from "react-router-dom";
import { useTranslation } from "react-utilities";
import {
  ListItem,
  ListItemChevronTrailingAccessory,
  ListItemLeadingAccessorySpacer,
  ListItemLeadingIcon,
  type TListItemDivider,
} from "@rbx/foundation-ui";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import { parentZonePages } from "../../../constants/parentalControls/parentZonePages";

// List component for managing a parent PIN
export const ParentPinManagementListItem = ({
  divider,
}: {
  divider: TListItemDivider;
}): JSX.Element => {
  const { translate } = useTranslation();
  const history = useHistory();

  const { parentPinManagement } = parentalControlsTranslationConstants;

  return (
    <ListItem
      isContained={false}
      size="Medium"
      divider={divider}
      title={translate(parentPinManagement.listItemTitle)}
      leading={
        <ListItemLeadingAccessorySpacer>
          <ListItemLeadingIcon name="icon-regular-key" />
        </ListItemLeadingAccessorySpacer>
      }
      trailing={<ListItemChevronTrailingAccessory />}
      onSelect={() => history.push(parentZonePages.manageOnDeviceParentPage.path)}
    />
  );
};

export default ParentPinManagementListItem;
