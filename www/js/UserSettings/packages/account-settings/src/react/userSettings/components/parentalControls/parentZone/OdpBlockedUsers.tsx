import React from "react";
import BlockedUsersList from "../../privacy/BlockedUsersList";
import { ManagementAction } from "../../../../../types/parentConsentsTypes";
import useManageOdpFriend from "./hooks/useManageOdpFriend";

const OdpBlockedUsers = (): JSX.Element => {
  const { manageFriend, isManaging } = useManageOdpFriend();
  return (
    <fieldset disabled={isManaging} className="stroke-none padding-none margin-none">
      <BlockedUsersList
        shouldShowParentalRelationshipView
        onUnblockUser={id => manageFriend(id, ManagementAction.Unblock)}
      />
    </fieldset>
  );
};

export default OdpBlockedUsers;
