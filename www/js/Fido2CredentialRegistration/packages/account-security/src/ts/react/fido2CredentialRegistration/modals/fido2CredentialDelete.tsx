import React from "react";
import { Modal } from "react-style-guide";
import { authenticatedUser } from "header-scripts";
import { AccountIntegrityChallengeService } from "Roblox";
import { ModalFragmentProps, CredentialPurpose } from "../constants/types";
import useFido2CredentialRegistrationContext from "../hooks/useFido2CredentialRegistrationContext";
import ModalState from "../store/modalState";
import { Fido2CredentialRegistrationActionType } from "../store/action";
import { EVENT_CONSTANTS, PASSKEYS_HELP_URL } from "../app.config";

const ModalFido2CredentialDelete: React.FC<ModalFragmentProps> = ({
  closeModal,
}: ModalFragmentProps) => {
  const {
    state: {
      translate,
      eventService,
      requestService,
      onDeleteSuccess,
      onLastKeyDeleted,
      onGenericError,
      credentialPurpose,
      modalStateAndProps,
      registeredKeys,
    },
    dispatch,
  } = useFido2CredentialRegistrationContext();

  // This case should never happen.
  if (modalStateAndProps.modalState !== ModalState.FIDO_CREDENTIAL_DELETE) {
    return <React.Fragment />;
  }

  // Return to management modal.
  const onGoBack = () => {
    dispatch({
      type: Fido2CredentialRegistrationActionType.SET_MODAL_STATE,
      modalState: ModalState.FIDO_CREDENTIAL_MANAGE,
      additionalModalProps: null,
    });
  };

  // eslint-disable-next-line consistent-return
  const deleteKeys = async () => {
    // Since credentialPurpose is necessarily an enum, default case is not required.
    // eslint-disable-next-line default-case
    switch (credentialPurpose) {
      case CredentialPurpose.Login:
        return requestService.authApi.deletePasskeyBatch(
          modalStateAndProps.additionalModalProps.keysToDeleteNames,
          registeredKeys.length,
        );
      case CredentialPurpose.TwoStepVerification:
        return requestService.twoStepVerification.deleteSecurityKey(
          authenticatedUser.id!.toString(),
          modalStateAndProps.additionalModalProps.keysToDeleteNames,
        );
    }
  };
  /*
   * Event Handlers
   */

  const onDeleteKey = async () => {
    const deleteFidoCredentialResult = await deleteKeys();

    if (deleteFidoCredentialResult.isError) {
      closeModal();
      const { Generic } = AccountIntegrityChallengeService;

      // Ignore challenge abandons for errors.
      if (!Generic.ChallengeError.matchAbandoned(deleteFidoCredentialResult.errorRaw)) {
        onGenericError();
        eventService.sendPasskeyRegistrationErrorEvent(
          String(deleteFidoCredentialResult.error ?? ""),
          EVENT_CONSTANTS.passkeyErrorSources.deletePasskey,
        );
      }
      return;
    }

    if (modalStateAndProps.additionalModalProps.deletedAllKeys) {
      onLastKeyDeleted();
    }

    closeModal();
    onDeleteSuccess();
  };

  /*
   * Component Markup
   */

  let headingTranslationString;
  let paragraphOneTranslationString;
  let paragraphTwoTranslationString;
  // eslint-disable-next-line default-case
  switch (credentialPurpose) {
    case CredentialPurpose.Login:
      headingTranslationString = "Heading.RemovePasskey";
      paragraphOneTranslationString = "Description.PasskeyDeletionWarning";
      paragraphTwoTranslationString = "Description.PasskeyMayStillAppear";
      break;
    case CredentialPurpose.TwoStepVerification:
      headingTranslationString = "Heading.RemoveSecurityKey";
      paragraphOneTranslationString = "Description.SecurityKey.Deletion";
      paragraphTwoTranslationString = "Description.SecurityKey.Warning";
  }

  return (
    <div className="result-fido-credential-modal">
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
        <div className="fido-credential-description-centered">
          <p>{translate(paragraphOneTranslationString)}</p>
        </div>
        <div className="fido-credential-description-centered">
          <p>
            {translate(paragraphTwoTranslationString)}
            {credentialPurpose === CredentialPurpose.Login && (
              <a
                href={PASSKEYS_HELP_URL}
                target="_blank"
                rel="noreferrer"
                className="text-link learn-more-link"
              >
                {translate("Label.LearnMore")}
              </a>
            )}
          </p>
        </div>
      </Modal.Body>
      <div className="modal-footer">
        <div className="fido-credential-dual-button-container">
          <button
            type="submit"
            className="btn-secondary-md btn-full-width"
            style={{
              display: "inline",
            }}
            onClick={onGoBack}
          >
            {translate("Action.GoBack")}
          </button>

          <button
            type="submit"
            className="btn-secondary-md btn-full-width"
            style={{
              display: "inline",
            }}
            onClick={onDeleteKey}
          >
            {translate("Action.DeleteSecurityKey")}
          </button>
        </div>
      </div>
    </div>
  );
};
export default ModalFido2CredentialDelete;
