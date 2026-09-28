import React from "react";
import { startWizard } from "@rbx/amp-v2-wizard";
import { authenticatedUser } from "header-scripts";
import baseApi from "../../../../apis/common/baseApi";
import { getChildFriendsCacheTag } from "../../../../apis/parentalControlsApi";
import { useAppDispatch } from "../../../../redux/hooks";
import { FindFriendsTypes, TFriendResponse } from "../../../../../types/friendsTypes";
import { ManagementAction } from "../../../../../types/parentConsentsTypes";
import useSettingsModal from "../../../../common/hooks/modals/useSettingsModal";
import FriendManageMenu from "../shared/FriendManageMenu";
import FriendRow from "../shared/FriendRow";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import { getProfileUrl } from "../../../constants/urlConstants";
import useFriendReportUrl from "../../../hooks/useFriendReportUrl";

const odpFlowName = "ODP";
const manageFriendRequestType = "ManageFriend";
const surface = "ParentalControlsSettings";

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
  const dispatch = useAppDispatch();
  const reportUrl = useFriendReportUrl(friend.id);
  const { friendManagement } = parentalControlsTranslationConstants;

  const blockFriend = async (): Promise<void> => {
    await startWizard({
      flow: {
        name: odpFlowName,
        props: {
          requestType: manageFriendRequestType,
          requestDetails: {
            friendUserId: String(friend.id),
            friendManagementAction: ManagementAction.Block,
          },
          isOdpInitiated: true,
        },
      },
      surface,
    }).catch(() => {
      // startWizard resolves on every exit, so there is nothing to recover from.
    });

    // Refetch friends list
    dispatch(
      baseApi.util.invalidateTags([
        getChildFriendsCacheTag(authenticatedUser.id!, FindFriendsTypes.Friends),
      ]),
    );
  };

  const [confirmBlockModal, confirmBlockModalService] = useSettingsModal({
    titleResourceId: friendManagement.confirmBlockHeading,
    bodyResourceId: friendManagement.confirmBlockDescription,
    size: "sm",
    actionButtonTextResourceId: friendManagement.block,
    neutralButtonTextResourceId: commonTranslationConstants.cancel,
    onAction: blockFriend,
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
