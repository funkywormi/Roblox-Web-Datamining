import React, { useEffect } from "react";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import FriendManagementSection from "./FriendManagementSection";
import parentalControlsEventService from "../../../services/eventServices/parentalControlsEventService";

const FriendManagement = ({ child }: { child: TChildInfo }): JSX.Element => {
  useEffect(() => {
    if (child?.shouldParentSeeTrustedConnections) {
      parentalControlsEventService.authPageloadSettingsPControlsTrustedFriends(child);
    }
  }, [child]);

  return (
    <FriendManagementSection child={child} showChips={child?.shouldParentSeeTrustedConnections} />
  );
};

export default FriendManagement;
