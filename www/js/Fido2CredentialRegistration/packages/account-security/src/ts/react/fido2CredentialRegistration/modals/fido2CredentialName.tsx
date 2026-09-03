import React, { useState, useEffect } from "react";
import { DeviceMeta } from "Roblox";
import { Modal } from "react-style-guide";
import { authenticatedUser } from "header-scripts";
import { CredentialPurpose, ModalFragmentProps } from "../constants/types";
import useFido2CredentialRegistrationContext from "../hooks/useFido2CredentialRegistrationContext";
import ModalState from "../store/modalState";
import InputControl, { validateTrue } from "../../common/inputControl";
import { FooterButtonConfig, FragmentModalFooter } from "../../common/modalFooter";
import { mapTwoStepVerificationErrorToResource } from "../constants/resources";
import { TwoStepVerificationError } from "../../../common/request/types/twoStepVerification";
import { EVENT_CONSTANTS } from "../app.config";

const ModalFido2CredentialName: React.FC<ModalFragmentProps> = ({
  closeModal,
}: ModalFragmentProps) => {
  const {
    state: {
      translate,
      eventService,
      requestService,
      onCreationSuccess,
      onGenericError,
      credentialPurpose,
      modalStateAndProps,
      registeredKeys,
      registrationSource,
    },
  } = useFido2CredentialRegistrationContext();

  /**
   * Component State
   */

  const [requestInFlight, setRequestInFlight] = useState<boolean>(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [name, setName] = useState<string>("");

  // eslint-disable-next-line consistent-return
  const setDefaultName = async () => {
    const { userAgent } = navigator;

    // This case should never happen and is for the type checker.
    if (modalStateAndProps.modalState !== ModalState.FIDO_CREDENTIAL_NAME) {
      return undefined;
    }

    // TODO: possibly consider having translations for these in the future. We're okay with all English for now.
    const keyTypes = [
      {
        name: "Windows Hello",
        condition: () => {
          return /Windows/.test(userAgent);
        },
      },
      {
        name: "Chrome on OSX",
        condition: () => {
          // Tests for Mac/Chrome with negative lookahead for OPR/Opera
          return /(?!.*(?:OPR|Opera)).*(?:Macintosh|Mac OS|MacOS|OS X).*Chrome.*/.test(userAgent);
        },
      },
      {
        name: "iCloud Keychain",
        condition: () => {
          return (
            (DeviceMeta && DeviceMeta().isIosApp) ||
            // Check for Mac OS + Safari, with same negative lookahead for OPR
            /(?!.*(?:OPR|Opera)).*(?:Macintosh|Mac OS|MacOS|OS X).*Safari.*/.test(userAgent)
          );
        },
      },
      {
        name: "Google Password Manager",
        condition: () => {
          return DeviceMeta && DeviceMeta().isAndroidApp;
        },
      },
    ];

    let keyName = "Passkey";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const credentialJSON = JSON.parse(modalStateAndProps.additionalModalProps.credential);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (credentialJSON.authenticatorAttachment === "platform")
      for (let i = 0; i < keyTypes.length; i++) {
        if (keyTypes[i]!.condition()) {
          keyName = keyTypes[i]!.name;
          break;
        }
      }

    let allRegisteredKeys;
    // Attempt to fetch a list of all the registered keys to avoid naming conflicts.
    const listAllCredentialsResult = await requestService.authApi.listAllCredentials();
    // If we fail for some reason, we can fall back to the registered keys we know about.
    if (listAllCredentialsResult?.isError) {
      allRegisteredKeys = registeredKeys;
    } else {
      allRegisteredKeys = listAllCredentialsResult.value.credentials;
    }

    const namesList = allRegisteredKeys.map(key => key.nickname);
    // Resolve key name conflicts by appending a number, starting from 2.
    let newKeyName = keyName;
    let counter = 1;
    while (namesList.includes(newKeyName)) {
      counter += 1;
      newKeyName = `${keyName} ${counter}`;
    }

    setName(newKeyName);
  };

  // eslint-disable-next-line consistent-return
  const submitCredential = async (credentialNickname: string) => {
    // This case should never happen and is for the type checker.
    if (modalStateAndProps.modalState !== ModalState.FIDO_CREDENTIAL_NAME) {
      return undefined;
    }

    // eslint-disable-next-line default-case
    switch (credentialPurpose) {
      case CredentialPurpose.Login:
        return requestService.authApi.finishPasskeyRegistration(
          modalStateAndProps.additionalModalProps.sessionId,
          credentialNickname,
          modalStateAndProps.additionalModalProps.credential,
          registrationSource,
        );
      case CredentialPurpose.TwoStepVerification:
        return requestService.twoStepVerification.enableVerifySecurityKey(
          authenticatedUser.id!.toString(),
          modalStateAndProps.additionalModalProps.sessionId,
          credentialNickname,
          modalStateAndProps.additionalModalProps.credential,
        );
    }
  };

  /*
   * Event Handlers
   */

  const clearRequestError = () => setRequestError(null);

  const submit = async () => {
    setRequestInFlight(true);

    const enableVerifySecurityKeyResult = await submitCredential(name);

    // enableVerifySecurityKeyResult should never be undefined.
    if (enableVerifySecurityKeyResult?.isError) {
      setRequestInFlight(false);
      // eslint-disable-next-line default-case
      switch (credentialPurpose) {
        case CredentialPurpose.Login:
          closeModal();
          onGenericError();
          eventService.sendPasskeyRegistrationErrorEvent(
            String(enableVerifySecurityKeyResult.error ?? ""),
            EVENT_CONSTANTS.passkeyErrorSources.finishStep,
          );
          break;
        case CredentialPurpose.TwoStepVerification:
          setRequestError(
            mapTwoStepVerificationErrorToResource(
              translate,
              enableVerifySecurityKeyResult.error as TwoStepVerificationError,
            ),
          );
      }
      return;
    }

    closeModal();
    onCreationSuccess();
  };

  const positiveButton: FooterButtonConfig = {
    // Show a spinner as the button content when a request is in flight.
    content: requestInFlight ? (
      <span className="spinner spinner-xs spinner-no-margin" />
    ) : (
      translate("Action.Dialog.Success")
    ),
    label: translate("Action.Dialog.Success"),
    enabled: !requestInFlight && name.length > 0,
    action: submit,
  };

  // Auto-submit default name for passkey registration.
  // Since setName is async, wait till the re-render to submit to ensure the credential name is updated.
  useEffect(() => {
    if (credentialPurpose === CredentialPurpose.Login) {
      if (!name) {
        // eslint-disable-next-line no-void
        void setDefaultName();
      } else {
        // eslint-disable-next-line no-void
        void submit();
      }
    }
  }, [name]);

  // Do not render a modal for login flow.
  if (credentialPurpose === CredentialPurpose.Login) {
    return <React.Fragment />;
  }

  /*
   * Component Markup
   */

  return (
    <React.Fragment>
      <div className="modal-header">
        <div className="modal-modern-header-button">
          <button type="button" className="close" onClick={closeModal}>
            <span aria-hidden="true">
              <span className="icon-close" />
            </span>
            <span className="sr-only">{translate("Action.Dialog.Close")}</span>
          </button>
        </div>
        <div className="modal-title">
          <h4>
            <span>{translate("Heading.NameSecurityKey")}</span>
          </h4>
        </div>
      </div>
      <Modal.Body>
        <div className="result-security-key-modal modal-margin-bottom">
          <div>{translate("Description.SecurityKey.NameKey")}</div>
        </div>
        <InputControl
          id="securityKeyName"
          inputType="text"
          disabled={requestInFlight}
          value={name}
          setValue={setName}
          error={requestError}
          setError={setRequestError}
          validate={validateTrue}
          canSubmit={name.length > 0}
          handleSubmit={submit}
          onChange={clearRequestError}
          // Optional parameters:
          autoComplete="off"
          placeholder={translate("Label.SecurityKey.Name")}
          maxLength={40}
          hideFeedback
        />
      </Modal.Body>
      <FragmentModalFooter positiveButton={positiveButton} negativeButton={null} />
    </React.Fragment>
  );
};
export default ModalFido2CredentialName;
