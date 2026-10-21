import React from "react";
import BlockedUsersList from "../../privacy/BlockedUsersList";
import { ManagementAction } from "../../../../../types/parentConsentsTypes";
import useManageOdpFriend from "./hooks/useManageOdpFriend";
import PrivacySettingName from "../../../../../enums/privacy/PrivacySettingName";
import { btnClickOdpManageFriend } from "../../../services/eventServices/odpFamilyEventService";
import { useGetParentInfoQuery } from "../../../../apis/parentalControlsApi";

const OdpBlockedUsers = (): JSX.Element => {
  const { manageFriend, isManaging } = useManageOdpFriend();
  const { data: parentInfo } = useGetParentInfoQuery();
  return (
    <fieldset disabled={isManaging} className="stroke-none padding-none margin-none">
      <BlockedUsersList
        shouldShowParentalRelationshipView
        onUnblockUser={id => {
          btnClickOdpManageFriend(
            PrivacySettingName.BlockedUsers,
            id,
            ManagementAction.Unblock,
            parentInfo?.parents,
          );
          return manageFriend(id, ManagementAction.Unblock);
        }}
      />
    </fieldset>
  );
};

export default OdpBlockedUsers;
