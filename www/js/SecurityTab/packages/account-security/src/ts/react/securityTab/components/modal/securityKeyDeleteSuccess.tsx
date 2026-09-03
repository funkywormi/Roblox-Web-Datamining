import React from "react";
import { Modal } from "react-style-guide";
import { ModalFragmentProps } from "../../constants/types";
import useSecurityTabContext from "../../hooks/useSecurityTabContext";
import ModalState from "../../store/modalState";

const ModalSecurityKeyDeleteSuccess: React.FC<ModalFragmentProps> = ({
  closeModal,
}: ModalFragmentProps) => {
  const {
    state: { resources, modalStateAndProps },
  } = useSecurityTabContext();

  // This case should never happen.
  if (modalStateAndProps.modalState !== ModalState.SECURITY_KEY_DELETE_SUCCESS) {
    return <React.Fragment />;
  }

  const formatDeletedKeys = () => {
    let deletedKeyList = "";
    if (modalStateAndProps.additionalModalProps.deletedKeys.length <= 1) {
      deletedKeyList = modalStateAndProps.additionalModalProps.deletedKeys[0]!;
    } else {
      for (let i = 0; i < modalStateAndProps.additionalModalProps.deletedKeys.length - 1; i++) {
        deletedKeyList += `${modalStateAndProps.additionalModalProps.deletedKeys[i]}, `;
      }
      deletedKeyList +=
        modalStateAndProps.additionalModalProps.deletedKeys[
          modalStateAndProps.additionalModalProps.deletedKeys.length - 1
        ];
    }
    return deletedKeyList;
  };

  /*
   * Component Markup
   */

  return (
    <div className="result-security-key-modal">
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
            <span>{resources.Heading.DeleteSecurityKeySuccess}</span>
          </h5>
        </div>
      </div>
      <Modal.Body>
        <div className="security-key-description-centered">
          {resources.Description.SecurityKey.DeleteSuccess(formatDeletedKeys())}
        </div>
      </Modal.Body>
      <div className="modal-footer">
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
    </div>
  );
};
export default ModalSecurityKeyDeleteSuccess;
