import React from "react";
import { Button } from "react-style-guide";
import { useTranslation } from "react-utilities";
import { AccessManagementUpsellV2Service } from "Roblox";
import { authenticatedUser } from "header-scripts";
import { useSnackbar } from "@rbx/user-settings";
import { TChildInfo } from "../../../../types/childrenInfoTypes";
import { TBlockedUser, TUnblockUserRequest } from "../../../../types/privacyTypes";
import {
  ManagementAction,
  ParentConsentStatus,
  ParentConsentType,
  TConsentData,
} from "../../../../types/parentConsentsTypes";
import privacyTranslationConstants from "../../constants/contentConstants/privacyTranslationConstants";
import commonTranslationConstants from "../../constants/contentConstants/commonTranslationConstants";
import { useUnblockUserMutation } from "../../../apis/userBlockingApi";
import baseApi from "../../../apis/common/baseApi";
import ApiCacheTag from "../../../apis/common/cacheTagEnum";
import AMPFeaturesConstants from "../../constants/AMPFeaturesConstants";
import { useAppDispatch } from "../../../redux/hooks";
import {
  useGetParentalConsentsQuery,
  useManageChildFriendMutation,
} from "../../../apis/parentalControlsApi";
import useCancelConsentRequestModal from "../../../common/hooks/modals/useCancelConsentRequestModal";
import useSettingsModal from "../../../common/hooks/modals/useSettingsModal";
import parentalControlsEventService from "../../services/eventServices/parentalControlsEventService";

export const BlockedUserWithParentalConsent = ({
  blockedCombinedName,
  blockedUser,
  blockedUsername,
  unblockDisabled,
  canRequestUnblock,
  child,
}: {
  blockedCombinedName: string | null | undefined;
  blockedUser: TBlockedUser;
  blockedUsername: string | null | undefined;
  unblockDisabled?: boolean;
  canRequestUnblock?: boolean;
  child?: TChildInfo;
}): JSX.Element => {
  const { snackbarService } = useSnackbar();
  const { translate } = useTranslation();
  const dispatch = useAppDispatch();

  const [unblockUserMutation, result] = useUnblockUserMutation();
  const [manageChildFriend] = useManageChildFriendMutation();

  const { data: parentalConsents } = useGetParentalConsentsQuery({
    childUserId: child?.userId ?? authenticatedUser.id!,
    consentStatus: ParentConsentStatus.Pending,
    consentType: ParentConsentType.ManageFriend,
  });
  const pendingConsent = parentalConsents?.consents.find(
    consent => consent.consentData?.friendUserId === blockedUser.blockedUserId,
  );

  const requestParentalConsent = async () => {
    try {
      await AccessManagementUpsellV2Service.startAccessManagementUpsell({
        featureName: AMPFeaturesConstants.CanRemoveParentManagedUserBlocks,
        namespace: AMPFeaturesConstants.Namespaces.AccountManagement,
        isAsyncCall: false,
        usePrologue: true,
        ampRecourseData: {
          friendUserId: blockedUser.blockedUserId,
          friendManagementAction: ManagementAction.Unblock,
          displayName: blockedUsername,
        },
      }).finally(() => {
        const invalidCacheTags = [ApiCacheTag.ParentalConsentsType];
        const invalidateAction = baseApi.util.invalidateTags(invalidCacheTags);
        dispatch(invalidateAction);
      });
    } catch (e) {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
    }
  };

  const unblockUser = async () => {
    try {
      if (child) {
        const details: TConsentData = {
          friendUserId: blockedUser.blockedUserId,
          friendManagementAction: ManagementAction.Unblock,
        };
        await manageChildFriend({
          childUserId: child?.userId,
          consentType: ParentConsentType.ManageFriend,
          details,
        }).unwrap();
      } else {
        const request: TUnblockUserRequest = {
          blockedUser,
          ignoreBlockManagerType: false,
        };
        await unblockUserMutation(request).unwrap();
      }
      snackbarService.success(
        translate(privacyTranslationConstants.unblockSuccess, {
          displayName: blockedUsername,
        }),
      );
    } catch (error) {
      snackbarService.warning(translate(error as string));
    }
  };

  // Modal for revoking consent request
  const [cancelConsentRequestModal, cancelConsentRequestModalService] =
    useCancelConsentRequestModal({
      pendingConsent,
    });

  // Modal for confirming unblock
  const [confirmUnblockModal, confirmUnblockModalService] = useSettingsModal({
    titleResourceId: privacyTranslationConstants.unblockHeading,
    bodyResourceId: child?.userId
      ? privacyTranslationConstants.parentSideUnblockDescription
      : privacyTranslationConstants.unblockDescription,
    actionButtonTextResourceId: privacyTranslationConstants.unblockBtnText,
    neutralButtonTextResourceId: commonTranslationConstants.cancel,
    onAction: async () => {
      if (child) {
        parentalControlsEventService.authButtonClickSettingsPControlsFriendsConfirmUnblock(
          child,
          blockedUser.blockedUserId,
        );
      } else {
        parentalControlsEventService.authButtonClickSettingsBlockedUsersConfirmUnblock(
          blockedUser.blockedUserId,
        );
      }
      await unblockUser();
    },
    onNeutral: () => {
      if (child) {
        parentalControlsEventService.authButtonClickSettingsPControlsFriendsCancelUnblock(
          child,
          blockedUser.blockedUserId,
        );
      } else {
        parentalControlsEventService.authButtonClickSettingsBlockedUsersCancelUnblock(
          blockedUser.blockedUserId,
        );
      }
    },
  });

  const userName = blockedUsername ? `@${blockedUsername}` : null;

  return (
    <React.Fragment>
      <li className="blocked-users-item">
        <div className="blocked-user-name text-overflow">
          {blockedCombinedName}
          <div className="text-secondary">{userName}</div>
        </div>
        {!child && pendingConsent ? (
          // Pending request button
          <Button
            className="user-blocking-btn"
            size={Button.sizes.small}
            variant={Button.variants.control}
            onClick={cancelConsentRequestModalService.open}
            width={Button.widths.default}
          >
            <span className="icon-uiblox-pending themified-icon" />
            {translate(commonTranslationConstants.pending)}
          </Button>
        ) : (
          // Unblock user button
          <Button
            className="user-blocking-btn"
            size={Button.sizes.small}
            variant={Button.variants.control}
            isDisabled={unblockDisabled}
            onClick={async () => {
              if (canRequestUnblock) {
                parentalControlsEventService.authButtonClickSettingsBlockedUsersUnblockVpc(
                  blockedUser.blockedUserId,
                );
                await requestParentalConsent();
              } else {
                if (child) {
                  parentalControlsEventService.authButtonClickSettingsPControlsFriendsUnblock(
                    child,
                    blockedUser.blockedUserId,
                  );
                  parentalControlsEventService.authModalShownSettingsPControlsFriendsUnblock(
                    child,
                    blockedUser.blockedUserId,
                  );
                } else {
                  parentalControlsEventService.authButtonClickSettingsBlockedUsersUnblock(
                    blockedUser.blockedUserId,
                  );
                  parentalControlsEventService.authModalShownSettingsBlockedUsersUnblock(
                    blockedUser.blockedUserId,
                  );
                }
                confirmUnblockModalService.open();
              }
            }}
            isLoading={result.isLoading}
            width={Button.widths.default}
          >
            {canRequestUnblock && <span className="icon-status-private themified-icon" />}
            {translate(privacyTranslationConstants.unblockBtnText)}
          </Button>
        )}
      </li>
      {cancelConsentRequestModal}
      {confirmUnblockModal}
    </React.Fragment>
  );
};

export default BlockedUserWithParentalConsent;
