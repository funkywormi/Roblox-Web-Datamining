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
import { btnClickOdpParentSettings } from "../../../services/eventServices/odpFamilyEventService";
import { useGetParentInfoQuery } from "../../../../apis/parentalControlsApi";

// List component for managing a parent PIN
export const ParentPinManagementListItem = ({
  divider,
}: {
  divider: TListItemDivider;
}): JSX.Element => {
  const { translate } = useTranslation();
  const history = useHistory();
  const { data: parentInfo } = useGetParentInfoQuery();

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
      onSelect={() => {
        btnClickOdpParentSettings(parentInfo?.parents);
        history.push(parentZonePages.manageOnDeviceParentPage.path);
      }}
      className="items-stretch"
    />
  );
};

export default ParentPinManagementListItem;
