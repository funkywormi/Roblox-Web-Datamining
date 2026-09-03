import { IModalService } from "react-style-guide";
import { useTranslation } from "react-utilities";
import { authenticatedUser } from "header-scripts";
import { FullTagDescription } from "@reduxjs/toolkit/dist/query/endpointDefinitions";
import { CancelPendingConsentErrorCode, useSnackbar } from "@rbx/user-settings";
import {
  ParentConsentStatus,
  ParentConsentType,
  TConsentResponse,
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

type TCancelConsentRequestModalProps = {
  pendingConsent: TConsentResponse | undefined;
  translatedBody?: React.ReactNode | undefined;
  onSuccess?: () => void;
};
const useCancelConsentRequestModal = ({
  pendingConsent,
  translatedBody,
  onSuccess,
}: TCancelConsentRequestModalProps): [JSX.Element, IModalService] => {
  const { snackbarService } = useSnackbar();
  const { translate } = useTranslation();

  const dispatch = useAppDispatch();

  const [cancelPendingConsent] = useCancelPendingConsentMutation();
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

  const { birthdate: birthdateTranslation } = accountInfoTranslationConstants;
  const { parentalConsents } = parentalControlsTranslationConstants;
  const [cancelConsentRequestModal, cancelConsentRequestModalService] = useSettingsModal({
    titleResourceId: parentalConsents.cancelRequest,
    bodyResourceId: parentalConsents.cancelSettingUpdateRequestDescription,
    translatedBody,
    actionButtonTextResourceId: parentalConsents.cancelRequest,
    neutralButtonTextResourceId: parentalConsents.doNotCancel,
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

export default useCancelConsentRequestModal;
