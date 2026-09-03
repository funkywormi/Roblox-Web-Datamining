import React, { useEffect } from "react";
import { Modal } from "react-style-guide";
import { ModalFragmentProps } from "../constants/types";
import useFido2CredentialRegistrationContext from "../hooks/useFido2CredentialRegistrationContext";
import ModalState from "../store/modalState";
import { Fido2CredentialRegistrationActionType } from "../store/action";
import { EVENT_CONSTANTS, PASSKEYS_HELP_URL } from "../app.config";

const ModalFido2CredentialConfirmTrust: React.FC<ModalFragmentProps> = ({
  closeModal,
}: ModalFragmentProps) => {
  const {
    state: { eventService, translate },
    dispatch,
  } = useFido2CredentialRegistrationContext();

  // Proxy event for "add passkey" button click.
  useEffect(() => {
    eventService.sendPasskeyRegistrationModalShownEvent();
  }, []);

  const onCancel = () => {
    eventService.sendPasskeyRegistrationButtonClickedEvent(EVENT_CONSTANTS.btn.cancel);
    closeModal();
  };

  const onContinue = () => {
    eventService.sendPasskeyRegistrationButtonClickedEvent(EVENT_CONSTANTS.btn.continue);
    dispatch({
      type: Fido2CredentialRegistrationActionType.SET_MODAL_STATE,
      modalState: ModalState.FIDO_CREDENTIAL_ENABLE,
      additionalModalProps: null,
    });
  };

  return (
    <div className="result-fido-credential-modal">
      <div className="modal-header">
        <div className="modal-modern-header-button">
          <button type="button" className="close" onClick={onCancel}>
            <span aria-hidden="true">
              <span className="icon-close" />
            </span>
            <span className="sr-only">{translate("Action.Dialog.Close")}</span>
          </button>
        </div>
        <div className="modal-title">
          <h4 className="fido-credential-header">{translate("Heading.AddAPasskey")}</h4>
        </div>
      </div>
      <Modal.Body>
        <div className="fido-credential-description-centered">
          <p>
            {translate("Description.PasskeysSecurityWarning")}
            <a
              href={PASSKEYS_HELP_URL}
              target="_blank"
              rel="noreferrer"
              className="text-link learn-more-link"
            >
              {translate("Label.LearnMore")}
            </a>
          </p>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <div className="fido-credential-dual-button-container">
          <button
            type="submit"
            className="btn-control-md btn-full-width"
            style={{
              display: "inline",
            }}
            onClick={onCancel}
          >
            {translate("Action.Cancel")}
          </button>
          <button
            type="submit"
            className="btn-growth-md btn-full-width"
            style={{
              display: "inline",
            }}
            onClick={onContinue}
          >
            {translate("Action.Dialog.Continue")}
          </button>
        </div>
      </Modal.Footer>
    </div>
  );
};
export default ModalFido2CredentialConfirmTrust;
