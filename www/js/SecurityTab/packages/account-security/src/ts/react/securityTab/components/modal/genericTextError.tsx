import React from "react";
import { Modal } from "react-style-guide";
import { ModalFragmentProps } from "../../constants/types";
import useSecurityTabContext from "../../hooks/useSecurityTabContext";
import ModalState from "../../store/modalState";

const ModalGenericTextError: React.FC<ModalFragmentProps> = ({
  closeModal,
}: ModalFragmentProps) => {
  const {
    state: { resources, modalStateAndProps },
  } = useSecurityTabContext();

  // This case should never happen.
  if (modalStateAndProps.modalState !== ModalState.GENERIC_TEXT_ERROR) {
    return <React.Fragment />;
  }

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
          <h2>
            <span>{modalStateAndProps.additionalModalProps.title}</span>
          </h2>
        </div>
      </div>
      <Modal.Body>
        <p className="modal-margin-bottom">{modalStateAndProps.additionalModalProps.body}</p>
      </Modal.Body>
      <div className="modal-buttons">
        <button
          className="modal-button btn-secondary-md"
          type="button"
          aria-label={modalStateAndProps.additionalModalProps.button}
          onClick={closeModal}
        >
          {modalStateAndProps.additionalModalProps.button}
        </button>
      </div>
    </React.Fragment>
  );
};
export default ModalGenericTextError;
