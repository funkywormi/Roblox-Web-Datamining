import React, { useEffect, useState } from "react";
import { useTranslation } from "react-utilities";
import { QueryStatus } from "@reduxjs/toolkit/query";
import { urlService } from "core-utilities";
import { useSnackbar } from "@rbx/user-settings";
import SettingsTextField from "../../../common/components/SettingsTextField";
import accountInfoTranslationConstants from "../../constants/contentConstants/accountInfoTranslationConstants";
import useChangeUsernameModal from "../../../common/hooks/modals/useChangeUsernameModal";
import useVerifyEmailModal from "../../../common/hooks/modals/useVerifyEmailModal";
import useSettingsModal, {
  useSettingsInfoModal,
} from "../../../common/hooks/modals/useSettingsModal";
import commonTranslationConstants from "../../constants/contentConstants/commonTranslationConstants";
import { buyRobuxUrl } from "../../constants/urlConstants";
import { robuxIcon } from "../../constants/usernameConstants";
import { initialModalQueryparam, shouldDisplayInitialModal } from "../../utils/hybridViewUtils";
import { useGetAccountInfoQuery } from "../../../apis/legacyAccountSettingsApi";
import { useGetUsernameChangePriceQuery } from "../../../apis/authApi";
import { useGetSettingsUiPolicyQuery } from "../../../apis/universalAppConfigurationApi";
import useSetEmailModal from "../../../common/hooks/modals/useSetEmailModal";

export const Username = (): JSX.Element => {
  const { data: uiPolicy } = useGetSettingsUiPolicyQuery();
  const { data: accountInfo, status: accountInfoStatus, isLoading } = useGetAccountInfoQuery();
  const {
    data: priceData,
    isLoading: isPriceLoading,
    isError: isPriceError,
  } = useGetUsernameChangePriceQuery();
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();
  const hasFreeNameChange = priceData?.isFreeUsernameChange;
  const isPriceSettled = !isPriceLoading;
  // An in-flight price is not yet an answer. Treating it as unavailable would route a paid,
  // under-funded user past the Robux check below, and the change modal has no affordability
  // check of its own, so they could submit a purchase they cannot cover.
  const isPriceUnavailable = isPriceError || (isPriceSettled && priceData == null);

  const hasDiscount = priceData != null && priceData.basePriceInRobux > priceData.priceInRobux;
  const discountAmount = hasDiscount ? priceData.basePriceInRobux - priceData.priceInRobux : 0;
  const robuxRemainingForChange =
    (accountInfo?.RobuxRemainingForUsernameChange ?? 0) - discountAmount;

  const [changeUsernameModal, changeUsernameModalService] = useChangeUsernameModal(
    hasFreeNameChange,
    priceData?.priceInRobux,
    priceData?.basePriceInRobux,
    hasDiscount,
    isPriceLoading,
    isPriceError,
  );

  const [verifyEmailModal, verifyEmailModalService] = useVerifyEmailModal(
    true,
    accountInfoTranslationConstants.changeUsername.unverifiedEmail,
  );

  const [setEmailModalV2, setEmailModalServiceV2] = useSetEmailModal(
    accountInfoTranslationConstants.changeUsername.missingEmail,
  );

  const [errorModal, errorModalService] = useSettingsInfoModal(
    commonTranslationConstants.modal.error.title,
    commonTranslationConstants.modal.error.body,
  );

  const [insufficientRobuxModal, insufficientRobuxModalService] = useSettingsModal({
    titleResourceId: accountInfoTranslationConstants.changeUsername.insufficientFundsHeading,
    translatedBody: (
      <span
        dangerouslySetInnerHTML={{
          __html: translate(
            accountInfoTranslationConstants.changeUsername.insufficientFundsDescription,
            {
              robuxToBuy: `${robuxIcon}<span>${
                robuxRemainingForChange > 0 ? robuxRemainingForChange : 0
              }</span>`,
            },
          ),
        }}
      />
    ),
    actionButtonTextResourceId: accountInfoTranslationConstants.changeUsername.buyBtn,
    onAction: () => {
      window.location.href = urlService.getAbsoluteUrl(buyRobuxUrl);
    },
    size: "sm",
  });

  const [isChangeUsernameRequested, setIsChangeUsernameRequested] = useState(false);

  const changeUsername = () => {
    setIsChangeUsernameRequested(true);
  };

  // The routing decision needs a settled price, so a request is recorded and resolved here
  // once both queries finish. This keeps a click made while the price is still loading from
  // being dropped, and keeps it from being answered before the price is known.
  useEffect(() => {
    if (!isChangeUsernameRequested) {
      return;
    }

    if (accountInfoStatus === QueryStatus.rejected) {
      setIsChangeUsernameRequested(false);
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
      return;
    }

    if (accountInfoStatus !== QueryStatus.fulfilled || !isPriceSettled) {
      return;
    }

    setIsChangeUsernameRequested(false);

    // No need to do eligibility check if the user is not requiered to pay for the change
    if (hasFreeNameChange) {
      changeUsernameModalService.open();

      // Email doesn't exist
    } else if (!accountInfo?.IsEmailOnFile) {
      setEmailModalServiceV2.open();

      // Email not verified
    } else if (!accountInfo?.IsEmailVerified) {
      verifyEmailModalService.open();

      // Currency Operation Error
    } else if (accountInfo?.HasCurrencyOperationError) {
      errorModalService.open();

      // Without a price we cannot tell a waived change from an unaffordable one, and the
      // account info figure carries no exemption of its own. Defer to the change modal,
      // which reports the failure, rather than quoting a purchase that may not be owed.
    } else if (isPriceUnavailable) {
      changeUsernameModalService.open();

      // Insufficient Robux (adjusted for subscription discount)
    } else if (robuxRemainingForChange > 0) {
      insufficientRobuxModalService.open();
    } else {
      changeUsernameModalService.open();
    }
  }, [isChangeUsernameRequested, accountInfoStatus, isPriceSettled]);

  // Check for Lua hybrid call to open change username modal from app
  useEffect(() => {
    const displayChangeUsernameHybridView = shouldDisplayInitialModal(
      initialModalQueryparam.changeUsername,
    );
    if (displayChangeUsernameHybridView) {
      changeUsername();
    }
  }, []);

  return (
    <React.Fragment>
      {!isLoading && (
        <SettingsTextField
          id="account-field-username"
          primaryEditLabel={translate(accountInfoTranslationConstants.changeUsername.editLabel)}
          label={translate(accountInfoTranslationConstants.changeUsername.label)}
          valueSet
          lines={[{ value: accountInfo?.Name ?? "" }]}
          primaryOnEdit={changeUsername}
          // A queued request is waiting on the price, so reflect that on the control the
          // user just pressed rather than leaving it looking unresponsive.
          primaryEditDisabled={isChangeUsernameRequested && !isPriceSettled}
          displayEditButton={Boolean(uiPolicy?.displayChangeUsername)}
        />
      )}
      {changeUsernameModal}
      {verifyEmailModal}
      {setEmailModalV2}
      {errorModal}
      {insufficientRobuxModal}
    </React.Fragment>
  );
};

export default Username;
