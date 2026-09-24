import { useTranslation } from "react-utilities";
import { List, type TListItemDivider } from "@rbx/foundation-ui";
import PreviewCard from "../../../../common/components/routing/PreviewCard";
import AddParentListItem from "./AddParentListItem";
import LinkedParentListItem from "./LinkedParentsListItem";
import ParentPinManagementListItem from "./ParentPinManagementListItem";
import useLinkedParentsState from "../../../hooks/useLinkedParentsState";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";

export const LinkedParentsList = (): JSX.Element => {
  const { translate } = useTranslation();
  const { hasOnDeviceParent, remoteParents, canAddRemoteParent } = useLinkedParentsState();

  const rows: ((divider: TListItemDivider) => JSX.Element)[] = [];

  remoteParents.forEach(parent => {
    rows.push(divider => (
      <LinkedParentListItem key={parent.userId} parent={parent} divider={divider} />
    ));
  });

  if (hasOnDeviceParent) {
    rows.push(divider => <ParentPinManagementListItem key="parent-pin" divider={divider} />);
  }

  if (canAddRemoteParent) {
    rows.push(divider => <AddParentListItem key="add-parent" divider={divider} />);
  }

  return (
    <PreviewCard title={translate(parentalControlsTranslationConstants.linkedParentsHeading)}>
      <List className="bg-shift-100 stroke-standard stroke-default radius-large clip">
        {rows.map((renderRow, index) => renderRow(index === rows.length - 1 ? "None" : "Inset"))}
      </List>
    </PreviewCard>
  );
};

export default LinkedParentsList;
