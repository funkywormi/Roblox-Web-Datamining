import React from "react";
import classNames from "classnames";
import { authenticatedUser } from "header-scripts";
import { AccountIntegrityChallengeService, DeviceMeta } from "Roblox";
import useSecurityTabContext from "../hooks/useSecurityTabContext";
import usePlatformSupportsPasskeyAndSecurityKey from "../../common/hooks/usePlatformSupportsPasskeyAndSecurityKey";
import { MediaType } from "../../challenge/twoStepVerification";
import { SecurityTabActionType } from "../store/action";
import ModalState from "../store/modalState";

type Props = {
  unlockPinAndToggleAuthenticator: (emailVerified: boolean) => void;
};

const SecurityKeyToggle: React.FC<Props> = ({ unlockPinAndToggleAuthenticator }: Props) => {
  const {
    state: { requestService, resources, enabledMediaTypes, twoStepVerificationMetadata },
    dispatch,
  } = useSecurityTabContext();

  const { isFido2SupportedViaHybridApi, isFido2SupportedViaBrowserApi } =
    usePlatformSupportsPasskeyAndSecurityKey({
      isAndroidSecurityKeyEnabled: twoStepVerificationMetadata.isAndroidSecurityKeyEnabled,
    });

  const showPlatformNotSupportedModal = () => {
    dispatch({
      type: SecurityTabActionType.SET_MODAL_STATE,
      modalState: ModalState.GENERIC_TEXT_ERROR,
      additionalModalProps: {
        title: resources.Heading.SecurityKey.PlatformNotSupported,
        body: resources.Description.SecurityKey.WebOnly,
        button: resources.Action.Dialog.Success,
      },
    });
  };

  /*
   * Event Handlers
   */

  const inApp = () => {
    return DeviceMeta && DeviceMeta().isInApp;
  };

  let registerSecurityKeyModalFlow: () => Promise<void>;
  const registerSecurityKey = async () => {
    if (isFido2SupportedViaBrowserApi()) {
      await registerSecurityKeyModalFlow();
    } else {
      const isAvailable = await isFido2SupportedViaHybridApi();
      if (isAvailable) {
        await registerSecurityKeyModalFlow();
      } else {
        showPlatformNotSupportedModal();
      }
    }
  };

  registerSecurityKeyModalFlow = async () => {
    const enableSecurityKeyResult = await requestService.twoStepVerification.enableSecurityKey(
      authenticatedUser.id!.toString(),
    );
    if (enableSecurityKeyResult.isError) {
      const { Generic } = AccountIntegrityChallengeService;
      // Ignore challenge abandons for errors.
      if (Generic.ChallengeError.matchAbandoned(enableSecurityKeyResult.errorRaw)) {
        return;
      }
      dispatch({
        type: SecurityTabActionType.SET_MODAL_STATE,
        modalState: ModalState.GENERIC_TEXT_ERROR,
        additionalModalProps: {
          title: resources.Heading.Dialog.DefaultError,
          body: resources.Response.Dialog.DefaultErrorMessage,
          button: resources.Action.Dialog.Success,
        },
      });
      return;
    }

    dispatch({
      type: SecurityTabActionType.SET_MODAL_STATE,
      modalState: ModalState.SECURITY_KEY_ENABLE,
      additionalModalProps: {
        creationOptions: enableSecurityKeyResult.value.creationOptions,
        sessionId: enableSecurityKeyResult.value.sessionId,
        isInApp: inApp(),
        registerSecurityKeyFunction: registerSecurityKey,
      },
    });
  };

  const enableSecurityKey = async () => {
    // If authenticator is not enabled then we prompt the user to enable authenticator first.
    if (!enabledMediaTypes.includes(MediaType.Authenticator)) {
      dispatch({
        type: SecurityTabActionType.SET_MODAL_STATE,
        modalState: ModalState.TURN_ON_AUTHENTICATOR,
        additionalModalProps: {
          enableAuthenticatorFunction: unlockPinAndToggleAuthenticator,
        },
      });
    } else {
      await registerSecurityKey();
    }
  };

  const manageSecurityKey = async () => {
    const listSecurityKeyResult = await requestService.twoStepVerification.listSecurityKey(
      authenticatedUser.id!.toString(),
    );
    if (listSecurityKeyResult.isError) {
      dispatch({
        type: SecurityTabActionType.SET_MODAL_STATE,
        modalState: ModalState.GENERIC_TEXT_ERROR,
        additionalModalProps: {
          title: resources.Heading.Dialog.DefaultError,
          body: resources.Response.Dialog.DefaultErrorMessage,
          button: resources.Action.Dialog.Success,
        },
      });
      return;
    }
    dispatch({
      type: SecurityTabActionType.SET_MODAL_STATE,
      modalState: ModalState.SECURITY_KEY_MANAGE,
      additionalModalProps: {
        registeredKeysList: listSecurityKeyResult.value.credentials,
        registerSecurityKeyFunction: registerSecurityKey,
      },
    });
  };

  /*
   * Component Markup
   */

  const isMobile = () => {
    return DeviceMeta && DeviceMeta().isPhone;
  };

  const isSecurityKeyEnabled = () => {
    return enabledMediaTypes.includes(MediaType.SecurityKey);
  };

  const toggleClassName = classNames("btn-toggle receiver-destination-type-toggle", {
    on: isSecurityKeyEnabled(),
  });

  return (
    <div className="section-content notifications-section">
      {!isSecurityKeyEnabled() && (
        <button
          type="button"
          id="2sv-security-key-toggle"
          className={toggleClassName}
          onClick={enableSecurityKey}
        >
          <span className="toggle-flip" />
          <span id="toggle-on" className="toggle-on" />
          <span id="toggle-off" className="toggle-off" />
        </button>
      )}
      <div className="security-2svsetting-label btn-toggle-label">
        <div className="security-keys-heading">
          <div className="btn-toggle-label-new-codes">
            {resources.Heading.SecurityKey.SecurityKey}
          </div>
          {isSecurityKeyEnabled() && (
            <button
              type="button"
              id="manage-security-keys"
              className="btn-control-sm acct-settings-btn"
              onClick={manageSecurityKey}
            >
              {resources.Label.Manage}
            </button>
          )}
        </div>
        {isMobile() && (
          <div>
            <br />
            <br />
          </div>
        )}
        <div className="rbx-divider" />
        <div className="text-description">{resources.Label.SecurityKey.SecurityKey}</div>
      </div>
    </div>
  );
};

export default SecurityKeyToggle;
