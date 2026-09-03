import React from "react";
import { Modal } from "react-style-guide";
import { ModalFragmentProps } from "../../constants/types";
import useSecurityTabContext from "../../hooks/useSecurityTabContext";
import ModalState from "../../store/modalState";

const ModalTurnOnAuthenticator: React.FC<ModalFragmentProps> = ({
  closeModal,
}: ModalFragmentProps) => {
  const {
    state: { resources, modalStateAndProps, mySettingsInfo },
  } = useSecurityTabContext();

  // This case should never happen.
  if (modalStateAndProps.modalState !== ModalState.TURN_ON_AUTHENTICATOR) {
    return <React.Fragment />;
  }

  /*
   * Event Handlers
   */

  const isEmailVerified = () =>
    mySettingsInfo !== null && mySettingsInfo.IsEmailOnFile && mySettingsInfo.IsEmailVerified;

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
            <span className="sr-only">{resources.Action.Dialog.Close}</span>
          </button>
        </div>
        <div className="modal-title">
          <h5>
            <span>{resources.Heading.TurnOnAuthenticator}</span>
          </h5>
        </div>
      </div>
      <Modal.Body>
        <div>{resources.Label.SecurityKey.TurnOnAuthenticator}</div>
      </Modal.Body>
      <Modal.Footer>
        <div className="modal-modern-footer-button">
          <button
            type="button"
            className="modal-button btn-secondary-md"
            onClick={() =>
              modalStateAndProps.additionalModalProps.enableAuthenticatorFunction(isEmailVerified())
            }
          >
            {resources.Action.Dialog.Success}
          </button>
        </div>
      </Modal.Footer>
    </React.Fragment>
  );
};
export default ModalTurnOnAuthenticator;
