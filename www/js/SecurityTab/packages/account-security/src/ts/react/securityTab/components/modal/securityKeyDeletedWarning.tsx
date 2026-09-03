import React, { useState } from "react";
import { Modal } from "react-style-guide";
import { ModalFragmentProps } from "../../constants/types";
import useSecurityTabContext from "../../hooks/useSecurityTabContext";
import ModalState from "../../store/modalState";
import useRedesignFlags from "../../hooks/useRedesignFlags";

const ModalSecurityKeyDeletedWarning: React.FC<ModalFragmentProps> = ({
  closeModal,
}: ModalFragmentProps) => {
  const {
    state: { resources, modalStateAndProps },
  } = useSecurityTabContext();

  const { isRedesignEnabled } = useRedesignFlags();

  const securityKeyText =
    (modalStateAndProps.additionalModalProps as { customMessage?: string }).customMessage ||
    (isRedesignEnabled
      ? resources.Description.SecurityKey.AuthenticatorDeletion
      : resources.Description.SecurityKey.AuthenticatorOff);

  /*
   * Component State
   */

  const [requestInFlight, setRequestInFlight] = useState<boolean>(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  // This case should never happen.
  if (modalStateAndProps.modalState !== ModalState.SECURITY_KEY_DELETED_WARNING) {
    return <React.Fragment />;
  }

  /*
   * Event Handlers
   */

  const confirm = async () => {
    await modalStateAndProps.additionalModalProps.pendingActionFunction(
      closeModal,
      setRequestError,
      setRequestInFlight,
    );

    // Call the completion callback if provided (e.g., to enable email after deletion)
    if (modalStateAndProps.additionalModalProps.onDeleteComplete) {
      await modalStateAndProps.additionalModalProps.onDeleteComplete();
    }
  };

  /*
   * Component Markup
   */

  return (
    <div className="update-two-step">
      <div className="modal-header">
        <div className="modal-modern-header-button">
          <button type="button" className="close" onClick={closeModal}>
            <span aria-hidden="true">
              <span className="icon-close" />
            </span>
            <span className="sr-only">{resources.Action.Dialog.Close}</span>
          </button>
        </div>
        <div className="modal-title">
          <h5>{modalStateAndProps.additionalModalProps.title}</h5>
        </div>
      </div>
      <Modal.Body>
        <div className="text-center">
          <div>{securityKeyText}</div>
          {requestError && <div className="two-step-modal-error text-error">{requestError} </div>}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="modal-modern-footer-buttons center-buttons">
          <button className="btn-cta-md" type="button" onClick={confirm} disabled={requestInFlight}>
            {resources.Label.Dialog.Confirm}
          </button>
          <button className="btn-secondary-md" type="button" onClick={closeModal}>
            {resources.Label.Cancel}
          </button>
        </div>
      </Modal.Footer>
    </div>
  );
};
export default ModalSecurityKeyDeletedWarning;
