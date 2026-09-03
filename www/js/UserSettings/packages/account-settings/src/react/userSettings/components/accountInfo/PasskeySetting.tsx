import React, { useState, useEffect } from "react";
import { useTranslation } from "react-utilities";
import { Fido2CredentialRegistrationService, DeviceMeta } from "Roblox";
import { hybridResponseService } from "core-roblox-utilities";
import classNames from "classnames";
import AUTH_EVENT_CONSTANTS from "@rbx/authentication-common/constants/eventsConstants";
import { useSnackbar } from "@rbx/user-settings";
import accountInfoTranslationConstants from "../../constants/contentConstants/accountInfoTranslationConstants";
import commonTranslationConstants from "../../constants/contentConstants/commonTranslationConstants";
import { useGetAccountInfoQuery } from "../../../apis/legacyAccountSettingsApi";
import { useGetRegisteredKeysQuery } from "../../../apis/authApi";
import useSettingsModal from "../../../common/hooks/modals/useSettingsModal";
import accountInfoEventService from "../../services/eventServices/accountInfoEventService";
import { passkeyCreatedStates } from "../../constants/accountInfo/accountInfoConstants";

export const PasskeySetting = (): JSX.Element => {
  const { data: registeredKeys, isLoading, refetch } = useGetRegisteredKeysQuery({ all: false });
  const { data: accountInfo } = useGetAccountInfoQuery();
  const { translate } = useTranslation();
  const { snackbarService } = useSnackbar();

  // Empty (undefined) initial value so we can delay showing the passkey setting until we resolve the supported value.
  const [fido2Supported, setFido2Supported] = useState<boolean>();

  useEffect(() => {
    const updateFido2Supported = async () => {
      if (DeviceMeta && DeviceMeta().isInApp) {
        if (DeviceMeta().isIosApp || DeviceMeta().isAndroidApp) {
          const isAvailable = await hybridResponseService.getNativeResponse(
            hybridResponseService.FeatureTarget.CREDENTIALS_PROTOCOL_AVAILABLE,
            {},
            10000,
          );
          accountInfoEventService.passkeyPageLoad(isAvailable === "true", isAvailable === null);
          setFido2Supported(isAvailable === "true");
        } else {
          accountInfoEventService.passkeyPageLoad(false);
          setFido2Supported(false);
        }
      } else {
        try {
          setFido2Supported(PublicKeyCredential !== undefined);
          accountInfoEventService.passkeyPageLoad(PublicKeyCredential !== undefined);
        } catch {
          accountInfoEventService.passkeyPageLoad(false);
          setFido2Supported(false);
        }
      }
    };
    // eslint-disable-next-line no-void
    void updateFido2Supported();
  }, []);

  const successModalBody = (
    <div className="passkey-description-centered">
      {translate(accountInfoTranslationConstants.passkey.skips2sv)}
    </div>
  );

  const [successModal, successModalService] = useSettingsModal({
    titleResourceId: accountInfoTranslationConstants.passkey.createdHeading,
    actionButtonTextResourceId: commonTranslationConstants.ok,
    translatedBody: successModalBody,
    size: "sm",
  });

  const onAddOrManagePasskey = () => {
    Fido2CredentialRegistrationService.renderFido2CredentialRegistration({
      containerId: "fido-registration-container",
      credentialPurpose: Fido2CredentialRegistrationService.CredentialPurpose.Login,
      registeredKeys: registeredKeys?.credentials,
      fido2Supported,
      deleteAllPasskeysAllowed: accountInfo?.HasValidPasswordSet,
      registrationSource: AUTH_EVENT_CONSTANTS.state.passkeyCreation.accountSettings,
      onCreationSuccess: () => {
        // eslint-disable-next-line no-void
        void refetch();
        accountInfoEventService.passkeyCreationSource(
          AUTH_EVENT_CONSTANTS.state.passkeyCreation.accountSettings,
        );
        if (accountInfo?.MyAccountSecurityModel.IsTwoStepEnabled) {
          accountInfoEventService.passkeyCreated(passkeyCreatedStates.twoStepEnabled);
          successModalService.open();
        } else {
          accountInfoEventService.passkeyCreated(passkeyCreatedStates.twoStepNotEnabled);
          snackbarService.success(
            translate(accountInfoTranslationConstants.passkey.createdSuccessfully),
          );
        }
      },
      onDuplicateCreated: () => {
        accountInfoEventService.passkeyCreated(passkeyCreatedStates.passkeyExists);
        snackbarService.warning(translate(accountInfoTranslationConstants.passkey.alreadyCreated));
      },
      onDeleteSuccess: () => {
        // eslint-disable-next-line no-void
        void refetch();
        snackbarService.success(
          translate(accountInfoTranslationConstants.passkey.removedSuccessfully),
        );
      },
      onRenameSuccess: () => {
        // eslint-disable-next-line no-void
        void refetch();
        snackbarService.success(
          translate(accountInfoTranslationConstants.passkey.renamedSuccessfully),
        );
      },
      onGenericError: () => {
        accountInfoEventService.passkeyCreated(passkeyCreatedStates.genericError);
        snackbarService.warning(translate(commonTranslationConstants.unknownError));
      },
    });
  };

  const deviceNotCompatibleWarning = (
    <div>
      <span className="icon-warning-orange" />
      <span className="passkey-incompatible-warning">
        {translate(accountInfoTranslationConstants.passkey.deviceNotCompatible)}
      </span>
    </div>
  );

  const upsellView = () => {
    return (
      <div className="passkey-upsell-banner">
        <span className="passkey-upsell-icon" />
        <div className="passkey-upsell-content">
          <div className="passkey-upsell-content-text">
            <h4 className="font-header-2 passkey-upsell-header ">
              {translate(accountInfoTranslationConstants.passkey.upsellHeading)}
            </h4>
            <p className="passkey-upsell-description">
              {translate(accountInfoTranslationConstants.passkey.upsellDescription)}
            </p>
          </div>
          <button
            className="btn-primary-md passkey-upsell-button"
            type="button"
            onClick={onAddOrManagePasskey}
          >
            <span>{translate(accountInfoTranslationConstants.passkey.addPasskey)}</span>
          </button>
        </div>
      </div>
    );
  };

  const hasRegisteredCredentials = Boolean(
    registeredKeys?.credentials.length && registeredKeys.credentials.length > 0,
  );

  const numPasskeysAdded = registeredKeys?.credentials.length ?? 0;
  let numPasskeysAddedText;
  switch (numPasskeysAdded) {
    case 0:
      numPasskeysAddedText = translate(accountInfoTranslationConstants.passkey.upsellDescription);
      break;
    case 1:
      numPasskeysAddedText = translate(accountInfoTranslationConstants.passkey.numAddedSingular);
      break;
    default:
      numPasskeysAddedText = translate(accountInfoTranslationConstants.passkey.numAddedPlural, {
        numPasskeysAdded,
      });
      break;
  }

  // View for managing and/or reporting device incompatibility.
  const textFieldView = () => {
    return (
      <div className="passkey-manage-region">
        <div className="passkey-manage-labels-button-container">
          <div className="passkey-manage-labels-container">
            <span className="text-title-large account-settings-label">
              {translate(accountInfoTranslationConstants.passkey.labelV2)}
            </span>
            <span>{numPasskeysAddedText}</span>
          </div>
          {hasRegisteredCredentials && (
            <button
              type="button"
              className="btn-secondary-md passkey-manage-button"
              onClick={onAddOrManagePasskey}
            >
              <span>{translate(accountInfoTranslationConstants.passkey.manage)}</span>
            </button>
          )}
        </div>
        {/* Only show the device not compatible warning if the user has no registered credentials (so the user doesn't see a manage button). */}
        {/* Otherwise, we count on the management modal to do this. */}
        {/* We are guaranteed that the device doesn't support FIDO2 if we are showing this view with no registered credentials. */}
        {!hasRegisteredCredentials && deviceNotCompatibleWarning}
      </div>
    );
  };

  const compatibilityCheckView = () => {
    return (
      <div className="passkey-compatibility-check">
        <div className="passkey-compatibility-spinner">
          <div className="spinner spinner-sm" />
        </div>
        <span className="passkey-compatibility-check-message">
          {translate(accountInfoTranslationConstants.passkey.checkingPasskeyCompatibility)}
        </span>
      </div>
    );
  };

  /* The compatibilityCheckView and upsellView are strictly shown for users that have no registered credentials.
   * For users with registered credentials, the textFieldView, and the manage passkey button, are always shown.
   * The textFieldView is responsible for showing the device incompatibility warning in the case that the user has no
   * registered credentials and their device does not support FIDO2. */
  let passkeySettingComponent = textFieldView;
  if (!hasRegisteredCredentials && fido2Supported === undefined) {
    passkeySettingComponent = compatibilityCheckView;
  } else if (!hasRegisteredCredentials && fido2Supported === true) {
    passkeySettingComponent = upsellView;
  }

  // Show upsell banner iff user has no passkeys registered and their device supports them.
  return (
    <React.Fragment>
      {successModal}
      <div id="fido-registration-container" />
      {/* Wait for registered keys query to complete before displaying passkey setting. */}
      {!isLoading && passkeySettingComponent()}
    </React.Fragment>
  );
};

export default PasskeySetting;
