import React, { useMemo } from "react";
import { Button, IconButton, Popover } from "react-style-guide";
import { CurrentUser } from "Roblox";
import { BadgeSizes, VerifiedBadgeIconContainer } from "roblox-badges";
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailAvatarHeadshotSize,
  ThumbnailFormat,
} from "roblox-thumbnails";
import { ParentalControlsErrorCode, useSnackbar } from "@rbx/user-settings";
import { useGetAbuseReportRevampPolicyQuery } from "../../../../apis/universalAppConfigurationApi";
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
import {
  getProfileUrl,
  getAbuseReportRevampUrl,
  getReportUrl,
} from "../../../constants/urlConstants";
import commonTranslationConstants from "../../../constants/contentConstants/commonTranslationConstants";
import parentalControlsTranslationConstants from "../../../constants/contentConstants/parentalControlsTranslationConstants";
import { popoverPadding } from "../../../constants/parentalControls/friendManagementConstants";
import parentalControlsEventService from "../../../services/eventServices/parentalControlsEventService";
import { useWrappedTranslation } from "../../../hooks/useWrappedTranslation";

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
  const { data: abuseReportRevampPolicy } = useGetAbuseReportRevampPolicyQuery();

  const getThumbnail = (): JSX.Element => {
    const thumbnail = (
      <Thumbnail2d
        containerClass="friend-thumbnail"
        type={ThumbnailTypes.avatarHeadshot}
        size={ThumbnailAvatarHeadshotSize.size150}
        targetId={friend.id}
        format={ThumbnailFormat.webp}
        imgClassName="friend-card-image"
      />
    );

    return thumbnail;
  };

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

  const getDisplayName = (): JSX.Element => {
    const displayNameContainer = (
      <div className="friend-name-container">
        <div className="display-name text-name">{displayName}</div>
        {friend.hasVerifiedBadge && (
          <VerifiedBadgeIconContainer
            size={BadgeSizes.SUBHEADER}
            additionalContainerClass="verified-badge"
          />
        )}
      </div>
    );

    return displayNameContainer;
  };

  const atUsername = isTrusted
    ? `@${userName} • ${translate(parentalControlsTranslationConstants.friendManagement.trustedLabel)}`
    : `@${userName}`;

  const reportUrl = useMemo(() => {
    if (abuseReportRevampPolicy?.EnableParentalDashboard) {
      return getAbuseReportRevampUrl({
        targetId: String(friend.id),
        submitterId: CurrentUser.userId,
        abuseVector: "userprofile",
      });
    }
    return getReportUrl(friend.id);
  }, [abuseReportRevampPolicy, friend.id]);

  return (
    <React.Fragment>
      {confirmBlockUserModal}
      <li className="friend-card-list-item">
        <a
          className="friend-card"
          href={getProfileUrl(friend.id)}
          // TODO ACCMAN-2256: Integrate deep linking
        >
          <div className="friend-thumbnails-container">{getThumbnail()}</div>
          <div className="friend-name-parent-container">
            {getDisplayName()}
            <div className="user-name">{atUsername}</div>
          </div>
        </a>

        {child?.canParentManageChildsFriends && (
          <Popover
            id={`manage-friend-dropdown-${friend.id}`}
            button={
              <IconButton
                className="friend-management-menu"
                iconName="overflow-vertical"
                size={IconButton.sizes.small}
                onClick={() => {
                  parentalControlsEventService.authButtonClickSettingsPControlsFriendsUserDetail(
                    child,
                    friend.id,
                  );
                }}
                altName={translate(commonTranslationConstants.manage)}
              />
            }
            trigger="click"
            containerPadding={popoverPadding}
            placement="bottom"
          >
            <ul className="dropdown-menu" role="menu">
              {/* View profile menu item */}
              <li>
                <a
                  href={getProfileUrl(friend.id)}
                  onClick={() => {
                    parentalControlsEventService.authButtonClickSettingsPControlsFriendsViewProfile(
                      child,
                      friend.id,
                    );
                  }}
                >
                  {translate(parentalControlsTranslationConstants.friendManagement.viewProfile)}
                </a>
              </li>

              {/* Block user menu item */}
              <li>
                <Button
                  variant={Button.variants.secondary}
                  onClick={() => {
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
                >
                  {translate(parentalControlsTranslationConstants.friendManagement.block)}
                </Button>
              </li>

              {/* Report user menu item */}
              <li>
                <a
                  href={reportUrl}
                  onClick={() => {
                    parentalControlsEventService.authButtonClickSettingsPControlsFriendsReport(
                      child,
                      friend.id,
                    );
                  }}
                >
                  {translate(parentalControlsTranslationConstants.friendManagement.report)}
                </a>
              </li>
            </ul>
          </Popover>
        )}
      </li>
      {maxBlockedFriendsModal}
    </React.Fragment>
  );
};

export default FriendListItem;
