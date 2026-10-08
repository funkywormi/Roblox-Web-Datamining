import React from "react";
import { TFriendResponse } from "../../../../../types/friendsTypes";
import { ManagementAction } from "../../../../../types/parentConsentsTypes";
import useSettingsModal from "../../../../common/hooks/modals/useSettingsModal";
import FriendManageMenu from "../shared/FriendManageMenu";
import FriendRow from "../shared/FriendRow";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import { getProfileUrl } from "../../../constants/urlConstants";
import useFriendReportUrl from "../../../hooks/useFriendReportUrl";
import useManageOdpFriend from "./hooks/useManageOdpFriend";

export const OdpFriendListItem = ({
  friend,
  displayName,
  userName,
  canManageFriends,
}: {
  friend: TFriendResponse;
  displayName: string;
  userName: string;
  canManageFriends: boolean;
}): JSX.Element => {
  const { manageFriend } = useManageOdpFriend();
  const reportUrl = useFriendReportUrl(friend.id);
  const { friendManagement } = parentalControlsTranslationConstants;

  const [confirmBlockModal, confirmBlockModalService] = useSettingsModal({
    titleResourceId: friendManagement.confirmBlockHeading,
    bodyResourceId: friendManagement.confirmBlockDescription,
    size: "sm",
    actionButtonTextResourceId: friendManagement.block,
    neutralButtonTextResourceId: commonTranslationConstants.cancel,
    onAction: () => manageFriend(friend.id, ManagementAction.Block),
  });

  return (
    <React.Fragment>
      {confirmBlockModal}
      <FriendRow
        friend={friend}
        displayName={displayName}
        userName={userName}
        trailing={
          canManageFriends && (
            <FriendManageMenu
              id={`odp-manage-friend-dropdown-${friend.id}`}
              profileUrl={getProfileUrl(friend.id)}
              reportUrl={reportUrl}
              onBlock={() => {
                confirmBlockModalService.open();
              }}
            />
          )
        }
      />
    </React.Fragment>
  );
};

export default OdpFriendListItem;
