import React from "react";
import { IModalService } from "react-style-guide";
import { useTranslation } from "react-utilities";
import { authenticatedUser } from "header-scripts";
import { FullTagDescription } from "@reduxjs/toolkit/dist/query/endpointDefinitions";
import { UserProfileField, useUserProfiles } from "@rbx/user-profile-api-client";

import { CancelPendingConsentErrorCode, useSnackbar } from "@rbx/user-settings";
import {
  ParentConsentStatus,
  ParentConsentType,
  TConsentResponse,
  PunishmentType,
} from "../../../../types/parentConsentsTypes";
import commonTranslationConstants from "../../../userSettings/constants/contentConstants/commonTranslationConstants";
import useSettingsModal from "./useSettingsModal";
import {
  getAllParentalConsentsCacheTags,
  useCancelPendingConsentMutation,
} from "../../../apis/parentalControlsApi";
import accountInfoTranslationConstants from "../../../userSettings/constants/contentConstants/accountInfoTranslationConstants";
import baseApi from "../../../apis/common/baseApi";
import ApiCacheTag from "../../../apis/common/cacheTagEnum";
import { useAppDispatch } from "../../../redux/hooks";
import accountInfoEventService from "../../../userSettings/services/eventServices/accountInfoEventService";
import { getFirstSettingNameInConsentData } from "../../../userSettings/utils/parentalControls/parentalConsentUtils";
import parentalControlsTranslationConstants from "../../../userSettings/constants/contentConstants/parentalControlsTranslationConstants";
import parentalControlsEventService from "../../../userSettings/services/eventServices/parentalControlsEventService";
import {
  getRequestSettingLabel,
  requestSettingLabels,
} from "../../../userSettings/constants/contentConstants/consentTranslationConstants";

type TCancelConsentRequestModalProps = {
  pendingConsent: TConsentResponse | undefined;
  translatedBody?: React.ReactNode | undefined;
  onSuccess?: () => void;
  canSeeChatTerminology?: boolean;
};
const useCancelConsentRequestModalV2 = ({
  pendingConsent,
  translatedBody,
  onSuccess,
  canSeeChatTerminology = false,
}: TCancelConsentRequestModalProps): [JSX.Element, IModalService] => {
  const { snackbarService } = useSnackbar();
  const { translate } = useTranslation();

  const dispatch = useAppDispatch();

  const [cancelPendingConsent] = useCancelPendingConsentMutation();
  const userProfileFields = [UserProfileField.Names.CombinedName];
  const consentTargetUserId =
    pendingConsent?.consentData?.friendUserId || pendingConsent?.consentData?.targetUserId || 0;

  const { data: userProfiles } = useUserProfiles([consentTargetUserId], userProfileFields);
  const invalidateCachedData = () => {
    let invalidCacheTags: (ApiCacheTag | FullTagDescription<ApiCacheTag>)[] = [
      ...getAllParentalConsentsCacheTags(authenticatedUser.id!, ParentConsentStatus.Pending),
    ];
    switch (pendingConsent?.consentType) {
      case ParentConsentType.UpdateBirthdate:
        invalidCacheTags = [
          ...invalidCacheTags,
          ApiCacheTag.Birthdate,
          ApiCacheTag.AccountInfo,
          ApiCacheTag.VerifiedAge,
        ];
        break;
      default:
    }
    const invalidateAction = baseApi.util.invalidateTags(invalidCacheTags);
    dispatch(invalidateAction);
  };

  const getEventState = (consent: TConsentResponse | undefined): string => {
    if (consent?.consentData) {
      switch (consent.consentType) {
        case ParentConsentType.UpdateBirthdate:
          return consent.consentData.newBirthdate ?? "";
        case ParentConsentType.UpdateUserSetting:
          // Return the name for the first setting we find in the consent data
          return getFirstSettingNameInConsentData(consent) as string;
        case ParentConsentType.ManageFriend: {
          if (consent.consentData?.friendUserId) {
            return consent.consentData?.friendUserId.toString();
          }
          break;
        }
        case ParentConsentType.AddTrustedConnection: {
          if (consent.consentData?.targetUserId) {
            return consent.consentData.targetUserId.toString();
          }
          break;
        }
        default:
          return consent.consentData as string;
      }
    }
    return "no consent data";
  };

  const getFeatureName = () => {
    switch (pendingConsent?.consentType) {
      case ParentConsentType.UpdateBirthdate:
        return translate(requestSettingLabels.birthday);
      case ParentConsentType.UpdateUserSetting: {
        // Return the name of the first setting we find in the consent data
        const settingName = getFirstSettingNameInConsentData(pendingConsent);
        const settingNameTranslationKey = getRequestSettingLabel(
          settingName as keyof typeof requestSettingLabels,
          canSeeChatTerminology,
        );
        if (settingNameTranslationKey) {
          return translate(settingNameTranslationKey);
        }
        return settingName;
      }
      case ParentConsentType.LiftPunishment: {
        if (pendingConsent?.consentData?.punishmentType === PunishmentType.Chargeback) {
          return translate(requestSettingLabels.chargebackUnlock);
        }
        return pendingConsent?.consentType;
      }
      case ParentConsentType.ManageFriend: {
        const displayName = pendingConsent?.consentData?.friendUserId
          ? (userProfiles?.[pendingConsent.consentData.friendUserId]?.names?.combinedName ?? "")
          : "";
        return translate(requestSettingLabels.unblockUser, {
          displayName,
        });
      }
      case ParentConsentType.AddTrustedConnection: {
        const username = pendingConsent?.consentData?.targetUserId
          ? (userProfiles?.[pendingConsent.consentData.targetUserId]?.names?.combinedName ?? "")
          : "";
        return translate(requestSettingLabels.addTrustedConnection, {
          username,
        });
      }
      default:
        return pendingConsent?.consentType;
    }
  };
  const body = translatedBody || (
    <span
      dangerouslySetInnerHTML={{
        __html: translate(
          parentalControlsTranslationConstants.parentalConsents.pendingRequestModal.description,
          { feature: getFeatureName() },
        ),
      }}
    />
  );
  const { birthdate: birthdateTranslation } = accountInfoTranslationConstants;
  const { parentalConsents } = parentalControlsTranslationConstants;
  const [cancelConsentRequestModal, cancelConsentRequestModalService] = useSettingsModal({
    titleResourceId: parentalConsents.pendingRequestModal.title,
    translatedBody: body,
    actionButtonTextResourceId: parentalConsents.cancelRequest,
    neutralButtonTextResourceId: commonTranslationConstants.modal.closeBtn,
    size: "sm",
    onAction: async () => {
      const eventState = getEventState(pendingConsent);
      if (pendingConsent?.consentType === ParentConsentType.UpdateBirthdate) {
        accountInfoEventService.confirmCancelPendingConsent(eventState);
      } else {
        parentalControlsEventService.authButtonClickSettingsPControlsCancelParentRequest(
          eventState,
          pendingConsent?.id ?? "",
        );
      }

      if (pendingConsent?.id) {
        try {
          await cancelPendingConsent(pendingConsent.id).unwrap();
          if (onSuccess) {
            onSuccess();
          }
          snackbarService.success(translate(parentalConsents.requestCancelled));
        } catch (error) {
          const errorCode = error as CancelPendingConsentErrorCode;
          if (errorCode === CancelPendingConsentErrorCode.ConsentAlreadyApplied) {
            snackbarService.warning(translate(birthdateTranslation.errors.alreadyApplied));
            invalidateCachedData();
          } else {
            snackbarService.warning(translate(commonTranslationConstants.unknownError));
          }
        }
      } else {
        snackbarService.warning(translate(commonTranslationConstants.unknownError));
      }
    },
    onNeutral: () => {
      const eventState = getEventState(pendingConsent);
      if (pendingConsent?.consentType === ParentConsentType.UpdateBirthdate) {
        accountInfoEventService.rejectCancelPendingConsent(eventState);
      } else {
        parentalControlsEventService.authButtonClickSettingsPControlsDoNotCancelParentRequest(
          eventState,
          pendingConsent?.id ?? "",
        );
      }
    },
  });

  const openModalService = () => {
    const eventState = getEventState(pendingConsent);
    parentalControlsEventService.authModalShownSettingsPControlsCancelRequest(
      eventState,
      pendingConsent?.id ?? "",
    );
    cancelConsentRequestModalService.open();
  };

  return [
    cancelConsentRequestModal,
    { open: openModalService, close: cancelConsentRequestModalService.close },
  ];
};

export default useCancelConsentRequestModalV2;
