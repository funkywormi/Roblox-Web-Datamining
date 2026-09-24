import { useTranslation } from "react-utilities";
import {
  ListItem,
  ListItemChevronTrailingAccessory,
  ListItemLeadingAccessorySpacer,
  ListItemLeadingIcon,
  type TListItemDivider,
} from "@rbx/foundation-ui";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import useManageParentPin from "../../../hooks/useManageParentPin";

// List component for managing a parent PIN
export const ParentPinManagementListItem = ({
  divider,
}: {
  divider: TListItemDivider;
}): JSX.Element => {
  const { translate } = useTranslation();
  const manageParentPin = useManageParentPin();

  const { parentPinManagement } = parentalControlsTranslationConstants;

  return (
    <ListItem
      isContained={false}
      size="Medium"
      divider={divider}
      title={translate(parentPinManagement.listItemTitle)}
      metadata={translate(parentPinManagement.listItemMetadata)}
      leading={
        <ListItemLeadingAccessorySpacer>
          <ListItemLeadingIcon name="icon-regular-lock-closed" />
        </ListItemLeadingAccessorySpacer>
      }
      trailing={<ListItemChevronTrailingAccessory />}
      onSelect={manageParentPin}
    />
  );
};

export default ParentPinManagementListItem;
