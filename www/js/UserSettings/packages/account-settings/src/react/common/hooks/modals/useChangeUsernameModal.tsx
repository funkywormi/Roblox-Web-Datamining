import React, { useState } from "react";
import { IModalService, Loading } from "react-style-guide";
import { currentUserHasVerifiedBadge, fetchTranslations } from "roblox-badges";
import { QueryStatus } from "@reduxjs/toolkit/dist/query";
import { useTranslation } from "react-utilities";
import { ChallengeAbandonedError, useSnackbar } from "@rbx/user-settings";
import useSettingsModal, { useSettingsInfoModal } from "./useSettingsModal";
import commonTranslationConstants from "../../../userSettings/constants/contentConstants/commonTranslationConstants";
import accountInfoTranslationConstants from "../../../userSettings/constants/contentConstants/accountInfoTranslationConstants";
import { robuxIcon } from "../../../userSettings/constants/usernameConstants";
import { usernameValidateErrorCodeToStringKeys } from "../../../userSettings/constants/errorCodeToStringKeyMappings";
import { hybridNavigation, hybridEvents } from "../../../userSettings/utils/hybridViewUtils";
import { useUpdateUsernameMutation, useValidateUsernameMutation } from "../../../apis/authApi";

const useChangeUsernameModal = (
  hasFreeNameChange: boolean | undefined,
  usernameChangePrice?: number,
  basePrice?: number,
  hasDiscount?: boolean,
  isPriceLoading?: boolean,
  isPriceError?: boolean,
): [JSX.Element, IModalService] => {
  const price = usernameChangePrice;
  const { translate } = useTranslation();

  // Paid username changes depend on the API-driven price. Rather than falling
  // back to a hardcoded default when the price query is loading or fails,
  // surface a loading or error state so the user never purchases at a price
  // that may not reflect their actual (possibly discounted) cost.
  const isPriceUnavailable = !hasFreeNameChange && (isPriceError || price == null);

  const [errorTranslationKey, setErrorTranslationKey] = useState("");
  const [newUsername, setNewUsername] = useState("");

  const [updateUsernameMutation, updateUserNameStatus] = useUpdateUsernameMutation();
  const [validateUsernameMutation] = useValidateUsernameMutation();
  const { snackbarService } = useSnackbar();

  const { changeUsername } = accountInfoTranslationConstants;

  const clearState = () => {
    setErrorTranslationKey("");
    setNewUsername("");
  };

  const onHide = () => {
    clearState();
    hybridNavigation(hybridEvents.closeUpdateUsernameModal);
  };

  const getUsernameErrorMessage = () => {
    if (errorTranslationKey) {
      return translate(errorTranslationKey);
    }
    return "";
  };

  const [successModal, successModalService] = useSettingsInfoModal(
    commonTranslationConstants.modal.success.title,
    changeUsername.changeUsernameSuccessDescription,
  );

  const validateUsername = async (username: string) => {
    if (username) {
      try {
        const response = await validateUsernameMutation(username).unwrap();
        setErrorTranslationKey(
          response
            ? usernameValidateErrorCodeToStringKeys[response.code]
            : commonTranslationConstants.unknownError,
        );
      } catch (error) {
        setErrorTranslationKey(error as string);
      }
    } else {
      setErrorTranslationKey(changeUsername.enterUsernameLabel);
    }
  };

  const submitChangeUsername = async () => {
    try {
      await updateUsernameMutation(newUsername).unwrap();
      successModalService.open();
      hybridNavigation(hybridEvents.updateUsernameModalSuccess);
      clearState();
    } catch (error) {
      clearState();
      // Ignore challenge abandons for errors.
      if (error !== ChallengeAbandonedError) {
        // Use system feedback to display error since username change modal closes on submit
        snackbarService.warning(translate(error as string));
      }
    }
  };

  const hasVerifiedBadge = currentUserHasVerifiedBadge();
  const verifiedBadgeUsernameChangeWarning =
    fetchTranslations().translatedVerifiedBadgeUsernameChangeText;

  const priceDescription =
    hasDiscount && basePrice != null ? (
      <span
        dangerouslySetInnerHTML={{
          __html: translate(changeUsername.changeUsernamePriceDescription, {
            robuxIcon,
            price: `<span style="text-decoration:line-through;opacity:0.5">${basePrice}</span> ${price}`,
          }),
        }}
      />
    ) : (
      <span
        dangerouslySetInnerHTML={{
          __html: translate(changeUsername.changeUsernamePriceDescription, {
            robuxIcon,
            price,
          }),
        }}
      />
    );

  const usernameInputSection = (
    <React.Fragment>
      <br />
      <br />
      <div className="form-horizontal">
        <div className="form-group">
          <input
            id="desired-username-text-box"
            name="username"
            className="form-control input-field"
            placeholder={translate(changeUsername.usernamePlaceholder)}
            autoComplete="off"
            value={newUsername}
            onChange={async e => {
              setNewUsername(e.target.value);
              await validateUsername(e.target.value);
            }}
          />
          <p className="text-error form-control-label modal-error-message">
            {getUsernameErrorMessage()}
          </p>
        </div>
      </div>
      {hasVerifiedBadge ? verifiedBadgeUsernameChangeWarning : translate(changeUsername.disclaimer)}
    </React.Fragment>
  );

  const renderChangeUsernameBody = (): JSX.Element => {
    if (!hasFreeNameChange && isPriceLoading) {
      return <Loading />;
    }
    if (isPriceUnavailable) {
      return (
        <p className="text-error modal-error-message">
          {translate(commonTranslationConstants.modal.error.body)}
        </p>
      );
    }
    return (
      <React.Fragment>
        {hasFreeNameChange
          ? translate(changeUsername.changeUsernameFreeDescription)
          : priceDescription}
        {usernameInputSection}
      </React.Fragment>
    );
  };

  const changeUsernameBody = renderChangeUsernameBody();

  const [changeUsernameModal, changeUsernameModalService] = useSettingsModal({
    titleResourceId: changeUsername.modalTitle,
    translatedBody: changeUsernameBody,
    actionButtonTextResourceId: hasFreeNameChange
      ? commonTranslationConstants.updateAction
      : changeUsername.buyBtn,
    disableActionButton:
      getUsernameErrorMessage() !== "" ||
      newUsername === "" ||
      (!hasFreeNameChange && isPriceLoading) ||
      isPriceUnavailable ||
      updateUserNameStatus.status === QueryStatus.pending ||
      updateUserNameStatus.status === QueryStatus.fulfilled,
    onAction: submitChangeUsername,
    onHide,
    size: "md",
  });

  const modals = (
    <React.Fragment>
      {changeUsernameModal}
      {successModal}
    </React.Fragment>
  );

  return [modals, changeUsernameModalService];
};

export default useChangeUsernameModal;
