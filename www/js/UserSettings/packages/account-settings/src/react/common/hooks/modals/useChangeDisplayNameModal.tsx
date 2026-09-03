import React, { useEffect, useState, useRef } from "react";
import { IModalService } from "react-style-guide";
import { useTranslation } from "react-utilities";
import { ExperimentationService } from "Roblox";
import { currentUserHasVerifiedBadge, fetchTranslations } from "roblox-badges";
import { authenticatedUser } from "header-scripts";
import {
  useChangeDisplayNameModal as useChangeDisplayNameModalFromPackage,
  useSnackbar,
} from "@rbx/user-settings";
import { TDisplayNameParams } from "../../../../types/accountInformationTypes";
import useSettingsModal from "./useSettingsModal";
import commonTranslationConstants from "../../../userSettings/constants/contentConstants/commonTranslationConstants";
import accountInfoTranslationConstants from "../../../userSettings/constants/contentConstants/accountInfoTranslationConstants";
import maxCharactersForDisplayName from "../../../userSettings/constants/displayNameConstants";
import { InternationalDisplayNameLayer } from "../../../userSettings/constants/experimentConstants";
import {
  useLazyValidateDisplayNameQuery,
  useUpdateDisplayNameMutation,
} from "../../../apis/usersApi";
import accountInfoEventService from "../../../userSettings/services/eventServices/accountInfoEventService";
import { useGetAccountInfoQuery } from "../../../apis/legacyAccountSettingsApi";
import { useGetDisplayAgedUpDisplayNameQuery } from "../../../apis/experimentApi";
import {
  useGetDisplayNamesPolicyQuery,
  useGetSettingsUiPolicyQuery,
} from "../../../apis/universalAppConfigurationApi";
import baseApi from "../../../apis/common/baseApi";
import ApiCacheTag from "../../../apis/common/cacheTagEnum";
import { useAppDispatch } from "../../../redux/hooks";

const useChangeDisplayNameModal = (): [React.JSX.Element, IModalService] => {
  const [errorTranslationKey, setErrorTranslationKey] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const { snackbarService } = useSnackbar();
  const { translate } = useTranslation();
  const dispatch = useAppDispatch();

  const [updateDisplayNameMutation] = useUpdateDisplayNameMutation();
  const [refetchValidateDisplayName] = useLazyValidateDisplayNameQuery();
  const { data: accountInfo, isLoading } = useGetAccountInfoQuery();
  const { data: showAgedUpDisplayNameFromIXP } = useGetDisplayAgedUpDisplayNameQuery();
  const { data: displayNamesPolicy } = useGetDisplayNamesPolicyQuery();
  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();
  const enableFoundationModals = uiPolicy?.enableFoundationModals ?? false;
  const showAgedUpDisplayName =
    (showAgedUpDisplayNameFromIXP || displayNamesPolicy?.RealNamesInDisplayNamesEnabled) ?? false;
  const loggedTextChangedExposureRef = useRef(false);

  const { displayName } = accountInfoTranslationConstants;

  useEffect(() => {
    if (!isLoading) {
      setNewDisplayName(accountInfo?.DisplayName ?? "");
    }
  }, [isLoading, accountInfo?.DisplayName]);

  const clearState = () => {
    setNewDisplayName(accountInfo?.DisplayName ?? "");
  };

  const clearStateToLatestProfile = () => {
    setErrorTranslationKey("");
    clearState();
  };
  // run changes
  const getDisplayNameErrorMessage = () => {
    if (errorTranslationKey) {
      return translate(errorTranslationKey);
    }
    return "";
  };

  const logTextChangedExposure = () => {
    if (!loggedTextChangedExposureRef.current) {
      loggedTextChangedExposureRef.current = true;
      // Log exposure to the IXP InternationalDisplayNameLayer (backend for display name validation is IXP gated)
      ExperimentationService?.getAllValuesForLayer(InternationalDisplayNameLayer)
        .then(() => ExperimentationService?.logLayerExposure(InternationalDisplayNameLayer))
        .catch(() => undefined);
    }
  };

  const validateDisplayName = async (name: string) => {
    logTextChangedExposure();
    if (name) {
      try {
        const params: TDisplayNameParams = {
          userId: authenticatedUser.id!,
          newDisplayName: name,
          showAgedUpDisplayName: showAgedUpDisplayName ?? false,
        };
        await refetchValidateDisplayName(params).unwrap();
        setErrorTranslationKey("");
      } catch (error) {
        setErrorTranslationKey(error as string);
      }
    } else {
      setErrorTranslationKey(displayName.tooShortLabel);
    }
  };

  const submitChangeDisplayName = async () => {
    const submittedName = newDisplayName;
    const previousDisplayName = accountInfo?.DisplayName ?? "";
    try {
      const params: TDisplayNameParams = {
        userId: authenticatedUser.id!,
        newDisplayName: submittedName,
        showAgedUpDisplayName: showAgedUpDisplayName ?? false,
      };
      await updateDisplayNameMutation(params).unwrap();
      snackbarService.success(translate(commonTranslationConstants.successDialogMessage));
      accountInfoEventService.changeDisplayNameSuccess(previousDisplayName, submittedName);
      setErrorTranslationKey("");
      setNewDisplayName(submittedName);
    } catch (error) {
      setErrorTranslationKey(error as string);
      clearState();
    }
  };

  const countdown = `${newDisplayName.length}/${maxCharactersForDisplayName}`;

  const displayVerifiedBadgeWarning = currentUserHasVerifiedBadge();
  const verifiedBadgeDisplayNameChangeWarning =
    fetchTranslations().translatedVerifiedBadgeDisplayNameChangeText;

  // V1 (Bootstrap) modal body
  const changeDisplayNameBodyV1 = (
    <React.Fragment>
      <input
        type="text"
        data-focus-me="true"
        placeholder={accountInfo?.DisplayName}
        maxLength={maxCharactersForDisplayName}
        className="form-control input-field"
        autoComplete="off"
        onChange={async e => {
          setNewDisplayName(e.target.value);
          await validateDisplayName(e.target.value);
        }}
        value={newDisplayName}
      />
      <div className="font-caption-body change-display-name-feedback-container">
        <p className="text-error">{getDisplayNameErrorMessage()}</p>
        <span className="count-down">{countdown}</span>
      </div>
      {displayVerifiedBadgeWarning ? (
        <p className="text-description font-caption-body important-description">
          {verifiedBadgeDisplayNameChangeWarning}
        </p>
      ) : (
        <p className="text-description font-caption-body important-description">
          {showAgedUpDisplayName
            ? translate(displayName.agedUp.modalDescription)
            : translate(displayName.modalDescription)}
        </p>
      )}
    </React.Fragment>
  );

  // V1 (Bootstrap) modal
  const [changeDisplayNameModalV1, changeDisplayNameModalServiceV1] = useSettingsModal({
    titleResourceId: showAgedUpDisplayName ? displayName.agedUp.modalTitle : displayName.modalTitle,
    translatedBody: changeDisplayNameBodyV1,
    actionButtonTextResourceId: commonTranslationConstants.saveAction,
    disableActionButton: getDisplayNameErrorMessage() !== "" || newDisplayName === "",
    onAction: submitChangeDisplayName,
    onHide: () => {
      clearStateToLatestProfile();
      accountInfoEventService.changeDisplayNameCancel(accountInfo?.DisplayName ?? "");
    },
    size: "sm",
  });

  // V2 (Foundation UI) modal - using the user-settings package
  const [changeDisplayNameModalV2, changeDisplayNameModalServiceV2] =
    useChangeDisplayNameModalFromPackage({
      showAgedUpDisplayName,
      translatedTitle: showAgedUpDisplayName
        ? translate(displayName.agedUp.modalTitle)
        : translate(displayName.modalTitle),
      translatedDescription: showAgedUpDisplayName
        ? translate(displayName.agedUp.modalDescription)
        : translate(displayName.modalDescription),
      translatedSaveButtonText: translate(commonTranslationConstants.saveAction),
      onSuccess: async (oldName: string, newName: string) => {
        dispatch(baseApi.util.invalidateTags([ApiCacheTag.AccountInfo]));

        snackbarService.success(translate(commonTranslationConstants.successDialogMessage));
        accountInfoEventService.changeDisplayNameSuccess(oldName, newName);
      },
      onCancel: (currentName: string) => {
        accountInfoEventService.changeDisplayNameCancel(currentName);
      },
      onTextChanged: logTextChangedExposure,
      translatedClearButtonAriaLabel: translate("Label.Clear"),
    });

  // Choose between V1 and V2
  const changeDisplayNameModal = enableFoundationModals
    ? changeDisplayNameModalV2
    : changeDisplayNameModalV1;
  const changeDisplayNameModalService = enableFoundationModals
    ? changeDisplayNameModalServiceV2
    : changeDisplayNameModalServiceV1;

  return [changeDisplayNameModal, changeDisplayNameModalService];
};

export default useChangeDisplayNameModal;
