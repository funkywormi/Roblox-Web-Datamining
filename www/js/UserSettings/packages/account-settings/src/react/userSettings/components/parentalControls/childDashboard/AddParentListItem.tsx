import { useTranslation } from "react-utilities";
import {
  ListItem,
  ListItemLeadingAccessorySpacer,
  ListItemLeadingIcon,
  type TListItemDivider,
} from "@rbx/foundation-ui";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import useHandleParentLinking from "../../../hooks/useHandleParentLinking";
import { btnClickAddParent } from "../../../services/eventServices/odpFamilyEventService";
import { useGetParentInfoQuery } from "../../../../apis/parentalControlsApi";

// List component for adding a remote linked parent
export const AddParentListItem = ({ divider }: { divider: TListItemDivider }): JSX.Element => {
  const { translate } = useTranslation();
  const handleParentLinking = useHandleParentLinking();
  const { data: parentInfo } = useGetParentInfoQuery();

  const handleParentLinkingWithEventTracking = (): void => {
    btnClickAddParent(parentInfo?.parents);
    handleParentLinking();
  };

  return (
    <ListItem
      isContained={false}
      size="Medium"
      divider={divider}
      title={translate(parentalControlsTranslationConstants.addParentLink.addParentAction)}
      leading={
        <ListItemLeadingAccessorySpacer>
          <ListItemLeadingIcon name="icon-regular-plus-large" />
        </ListItemLeadingAccessorySpacer>
      }
      onSelect={handleParentLinkingWithEventTracking}
      className="items-stretch"
    />
  );
};

export default AddParentListItem;
