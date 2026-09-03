import React, { useState } from "react";
import { Modal } from "react-style-guide";
import { authenticatedUser } from "header-scripts";
import { AuthApiError } from "@rbx/authentication-common/passkey/api";
import { CredentialPurpose, ModalFragmentProps } from "../constants/types";
import useFido2CredentialRegistrationContext from "../hooks/useFido2CredentialRegistrationContext";
import ModalState from "../store/modalState";
import { Fido2CredentialRegistrationActionType } from "../store/action";
import InputControl, { validateTrue } from "../../common/inputControl";
import { FooterButtonConfig, FragmentModalFooter } from "../../common/modalFooter";
import {
  mapAuthApiErrorToResource,
  mapTwoStepVerificationErrorToResource,
} from "../constants/resources";
import { TwoStepVerificationError } from "../../../common/request/types/twoStepVerification";
import { EVENT_CONSTANTS } from "../app.config";

const ModalFido2CredentialRename: React.FC<ModalFragmentProps> = ({
  closeModal,
}: ModalFragmentProps) => {
  const {
    state: {
      translate,
      eventService,
      requestService,
      onRenameSuccess,
      credentialPurpose,
      modalStateAndProps,
    },
    dispatch,
  } = useFido2CredentialRegistrationContext();

  const [requestInFlight, setRequestInFlight] = useState<boolean>(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [name, setName] = useState<string>(
    modalStateAndProps.modalState === ModalState.FIDO_CREDENTIAL_RENAME
      ? modalStateAndProps.additionalModalProps.currentNickname
      : "",
  );

  if (modalStateAndProps.modalState !== ModalState.FIDO_CREDENTIAL_RENAME) {
    return <React.Fragment />;
  }

  const { credentialID, currentNickname } = modalStateAndProps.additionalModalProps;
  const isUnchanged = name === currentNickname;

  const renameCredential = async (newNickname: string) => {
    // eslint-disable-next-line default-case
    switch (credentialPurpose) {
      case CredentialPurpose.Login:
        return requestService.authApi.renamePasskey(credentialID, newNickname);
      case CredentialPurpose.TwoStepVerification:
        return requestService.twoStepVerification.renameSecurityKey(
          authenticatedUser.id!.toString(),
          credentialID,
          newNickname,
        );
    }
  };

  const clearRequestError = () => setRequestError(null);

  const submit = async () => {
    // No-op if the name hasn't changed.
    if (isUnchanged) {
      closeModal();
      return;
    }
    setRequestInFlight(true);

    const renameResult = await renameCredential(name);

    if (renameResult?.isError) {
      setRequestInFlight(false);
      // Keep the modal open and show the error inline (rename is recoverable).
      // eslint-disable-next-line default-case
      switch (credentialPurpose) {
        case CredentialPurpose.Login:
          setRequestError(mapAuthApiErrorToResource(translate, renameResult.error as AuthApiError));
          break;
        case CredentialPurpose.TwoStepVerification:
          setRequestError(
            mapTwoStepVerificationErrorToResource(
              translate,
              renameResult.error as TwoStepVerificationError,
            ),
          );
          break;
      }
      eventService.sendPasskeyRegistrationErrorEvent(
        String(renameResult.error ?? ""),
        EVENT_CONSTANTS.passkeyErrorSources.renamePasskey,
      );
      return;
    }

    closeModal();
    onRenameSuccess();
  };

  let headingTranslationString;
  // eslint-disable-next-line default-case
  switch (credentialPurpose) {
    case CredentialPurpose.Login:
      headingTranslationString = "Heading.RenamePasskey";
      break;
    case CredentialPurpose.TwoStepVerification:
      headingTranslationString = "Heading.RenameSecurityKey";
      break;
  }

  const positiveButton: FooterButtonConfig = {
    content: requestInFlight ? (
      <span className="spinner spinner-xs spinner-no-margin" />
    ) : (
      translate("Action.Dialog.Success")
    ),
    label: translate("Action.Dialog.Success"),
    enabled: !requestInFlight && name.length > 0 && !isUnchanged,
    action: submit,
  };

  const onGoBack = () => {
    dispatch({
      type: Fido2CredentialRegistrationActionType.SET_MODAL_STATE,
      modalState: ModalState.FIDO_CREDENTIAL_MANAGE,
      additionalModalProps: null,
    });
  };

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
            <span>{translate(headingTranslationString)}</span>
          </h4>
        </div>
      </div>
      <Modal.Body>
        <div className="result-security-key-modal modal-margin-bottom">
          <div>{translate("Description.SecurityKey.RenameKey")}</div>
        </div>
        <InputControl
          id="credentialRename"
          inputType="text"
          disabled={requestInFlight}
          value={name}
          setValue={setName}
          error={requestError}
          setError={setRequestError}
          validate={validateTrue}
          canSubmit={name.length > 0 && !isUnchanged}
          handleSubmit={submit}
          onChange={clearRequestError}
          autoComplete="off"
          placeholder={translate("Label.SecurityKey.Name")}
          maxLength={40}
          hideFeedback
        />
      </Modal.Body>
      <FragmentModalFooter
        positiveButton={positiveButton}
        negativeButton={{
          content: translate("Action.GoBack"),
          label: translate("Action.GoBack"),
          enabled: !requestInFlight,
          action: onGoBack,
        }}
      />
    </React.Fragment>
  );
};

export default ModalFido2CredentialRename;
