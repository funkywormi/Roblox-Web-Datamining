import React from "react";
import { useTranslation } from "react-utilities";
import {
  List,
  ListItem,
  ListItemLeadingAccessorySpacer,
  ListItemLeadingIcon,
} from "@rbx/foundation-ui";
import { useGetParentInfoQuery } from "../../../../apis/parentalControlsApi";
import PreviewCard from "../../../../common/components/routing/PreviewCard";
import LinkedParentListItem from "./LinkedParentsListItem";
import useHandleParentLinking from "../../../hooks/useHandleParentLinking";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";

export const LinkedParentsList = (): JSX.Element => {
  const { translate } = useTranslation();
  const { data: parentData } = useGetParentInfoQuery();
  const handleParentLinking = useHandleParentLinking();

  const getLinkedParentsListItems = (): JSX.Element | undefined => {
    if (!parentData?.parents) {
      return undefined;
    }

    const listItems = parentData.parents.map(parent => (
      <LinkedParentListItem key={parent.userId} parent={parent} />
    ));

    return <React.Fragment>{listItems}</React.Fragment>;
  };

  return (
    <PreviewCard title={translate(parentalControlsTranslationConstants.linkedParentsHeading)}>
      <List className="flex flex-col gap-xlarge">
        {getLinkedParentsListItems()}
        {parentData?.canAddParent && (
          <ListItem
            className="bg-shift-100 radius-medium clip"
            isContained={false}
            size="Large"
            divider="None"
            title={translate(parentalControlsTranslationConstants.addParentLink.addParentAction)}
            leading={
              <ListItemLeadingAccessorySpacer>
                <ListItemLeadingIcon name="icon-regular-plus-large" />
              </ListItemLeadingAccessorySpacer>
            }
            onSelect={handleParentLinking}
          />
        )}
      </List>
    </PreviewCard>
  );
};

export default LinkedParentsList;
