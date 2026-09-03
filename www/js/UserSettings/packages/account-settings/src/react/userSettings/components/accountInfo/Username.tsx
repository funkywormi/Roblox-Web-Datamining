import React, { useEffect } from "react";
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
import { robuxIcon, internalResetUsernamePrefix } from "../../constants/usernameConstants";
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
  const hasFreeNameChange = accountInfo?.Name.startsWith(internalResetUsernamePrefix);

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

  const changeUsername = () => {
    if (accountInfoStatus === QueryStatus.fulfilled) {
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

        // Insufficient Robux (adjusted for subscription discount)
      } else if (robuxRemainingForChange > 0) {
        insufficientRobuxModalService.open();
      } else {
        changeUsernameModalService.open();
      }
    } else if (accountInfoStatus === QueryStatus.rejected) {
      snackbarService.warning(translate(commonTranslationConstants.unknownError));
    }
  };

  // Check for Lua hybrid call to open change username modal from app
  useEffect(() => {
    const displayChangeUsernameHybridView = shouldDisplayInitialModal(
      initialModalQueryparam.changeUsername,
    );
    if (displayChangeUsernameHybridView) {
      changeUsername();
    }
  }, [accountInfoStatus]);

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
