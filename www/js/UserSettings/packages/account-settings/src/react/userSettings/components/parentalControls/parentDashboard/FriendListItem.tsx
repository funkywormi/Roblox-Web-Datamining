import React from "react";
import { ParentalControlsErrorCode, useSnackbar } from "@rbx/user-settings";
import { TChildInfo } from "../../../../../types/childrenInfoTypes";
import {
  ManagementAction,
  ParentConsentType,
  TConsentData,
} from "../../../../../types/parentConsentsTypes";
import useSettingsModal, {
  useSettingsInfoModal,
} from "../../../../common/hooks/modals/useSettingsModal";
import { useManageChildFriendMutation } from "../../../../apis/parentalControlsApi";
import { TFriendResponse } from "../../../../../types/friendsTypes";
import { getProfileUrl } from "../../../constants/urlConstants";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import parentalControlsEventService from "../../../services/eventServices/parentalControlsEventService";
import useFriendReportUrl from "../../../hooks/useFriendReportUrl";
import { useWrappedTranslation } from "../../../hooks/useWrappedTranslation";
import FriendManageMenu from "../shared/FriendManageMenu";
import FriendRow from "../shared/FriendRow";

export const FriendListItem = ({
  friend,
  child,
  displayName,
  userName,
  isTrusted = false,
}: {
  friend: TFriendResponse;
  child: TChildInfo;
  displayName: string;
  userName: string;
  isTrusted?: boolean;
}): JSX.Element => {
  const [manageChildFriend] = useManageChildFriendMutation();
  const { snackbarService } = useSnackbar();
  const { translate } = useWrappedTranslation();
  const reportUrl = useFriendReportUrl(friend.id);

  const [maxBlockedFriendsModal, maxBlockedFriendsModalService] = useSettingsInfoModal(
    parentalControlsTranslationConstants.friendManagement.cantBlockUser,
    parentalControlsTranslationConstants.friendManagement.maxUsersBlocked,
  );
  const blockUserForChild = async (): Promise<void> => {
    try {
      const details: TConsentData = {
        friendUserId: friend.id,
        friendManagementAction: ManagementAction.Block,
      };
      await manageChildFriend({
        childUserId: child.userId,
        consentType: ParentConsentType.ManageFriend,
        details,
      }).unwrap();
      snackbarService.success(
        translate(parentalControlsTranslationConstants.friendManagement.blockUserSuccess, {
          displayName,
        }),
      );
    } catch (error) {
      const errorCode = error as ParentalControlsErrorCode;
      if (errorCode === ParentalControlsErrorCode.UserBlockingLimitReached) {
        parentalControlsEventService.authModalShownSettingsPControlsFriendsCantBlock(
          child,
          friend.id,
        );
        maxBlockedFriendsModalService.open();
      } else {
        snackbarService.warning(translate(commonTranslationConstants.unknownError));
      }
    }
  };

  const [confirmBlockUserModal, confirmBlockUserModalService] = useSettingsModal({
    titleResourceId: parentalControlsTranslationConstants.friendManagement.confirmBlockHeading,
    bodyResourceId: parentalControlsTranslationConstants.friendManagement.confirmBlockDescription,
    size: "sm",
    actionButtonTextResourceId: parentalControlsTranslationConstants.friendManagement.block,
    neutralButtonTextResourceId: commonTranslationConstants.cancel,
    onAction: async () => {
      parentalControlsEventService.authButtonClickSettingsPControlsFriendsConfirmBlock(
        child,
        friend.id,
      );
      await blockUserForChild();
    },
    onNeutral: () => {
      parentalControlsEventService.authButtonClickSettingsPControlsFriendsCancelBlock(
        child,
        friend.id,
      );
    },
  });

  return (
    <React.Fragment>
      {confirmBlockUserModal}
      <FriendRow
        friend={friend}
        displayName={displayName}
        userName={userName}
        isTrusted={isTrusted}
        trailing={
          child?.canParentManageChildsFriends && (
            <FriendManageMenu
              id={`manage-friend-dropdown-${friend.id}`}
              profileUrl={getProfileUrl(friend.id)}
              reportUrl={reportUrl}
              onOpen={() => {
                parentalControlsEventService.authButtonClickSettingsPControlsFriendsUserDetail(
                  child,
                  friend.id,
                );
              }}
              onViewProfile={() => {
                parentalControlsEventService.authButtonClickSettingsPControlsFriendsViewProfile(
                  child,
                  friend.id,
                );
              }}
              onBlock={() => {
                parentalControlsEventService.authButtonClickSettingsPControlsFriendsBlock(
                  child,
                  friend.id,
                );
                parentalControlsEventService.authModalShownSettingsPControlsFriendsConfirmBlock(
                  child,
                  friend.id,
                );
                confirmBlockUserModalService.open();
              }}
              onReport={() => {
                parentalControlsEventService.authButtonClickSettingsPControlsFriendsReport(
                  child,
                  friend.id,
                );
              }}
            />
          )
        }
      />
      {maxBlockedFriendsModal}
    </React.Fragment>
  );
};

export default FriendListItem;
