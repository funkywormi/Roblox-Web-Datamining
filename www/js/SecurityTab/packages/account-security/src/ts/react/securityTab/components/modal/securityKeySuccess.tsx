import React from "react";
import { Modal } from "react-style-guide";
import { ModalFragmentProps } from "../../constants/types";
import useSecurityTabContext from "../../hooks/useSecurityTabContext";
import ModalState from "../../store/modalState";

const ModalSecurityKeySuccess: React.FC<ModalFragmentProps> = ({
  closeModal,
}: ModalFragmentProps) => {
  const {
    state: { resources, modalStateAndProps },
  } = useSecurityTabContext();

  // This case should never happen.
  if (modalStateAndProps.modalState !== ModalState.SECURITY_KEY_SUCCESS) {
    return <React.Fragment />;
  }

  /*
   * Component Markup
   */

  return (
    <div className="result-security-key-modal">
      <div className="modal-header">
        <div className="modal-modern-header-button" />
        <div className="modal-title">
          <h5>
            <span>{resources.Heading.SecurityKeyRegistered}</span>
          </h5>
        </div>
      </div>
      <Modal.Body>
        <div className="security-key-description-centered">
          {resources.Description.SecurityKey.Register2SV}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <div className="security-key-dual-button-container">
          <button
            type="submit"
            className="btn-cta-md btn-full-width"
            style={{
              display: "inline",
            }}
            onClick={modalStateAndProps.additionalModalProps.registerSecurityKeyFunction}
          >
            {resources.Action.AddSecurityKey}
          </button>
          <button
            type="submit"
            className="btn-cta-md btn-full-width"
            style={{
              display: "inline",
            }}
            onClick={closeModal}
          >
            {resources.Action.Done}
          </button>
        </div>
      </Modal.Footer>
    </div>
  );
};
export default ModalSecurityKeySuccess;
