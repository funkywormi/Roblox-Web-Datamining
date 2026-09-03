import React from "react";
import { Modal } from "react-style-guide";
import { ModalFragmentProps } from "../../constants/types";
import useSecurityTabContext from "../../hooks/useSecurityTabContext";
import ModalState from "../../store/modalState";
import { FooterButtonConfig, FragmentModalFooter } from "../../../common/modalFooter";

const ModalSecurityKeyError: React.FC<ModalFragmentProps> = ({
  closeModal,
}: ModalFragmentProps) => {
  const {
    state: { resources, modalStateAndProps },
  } = useSecurityTabContext();

  // This case should never happen.
  if (modalStateAndProps.modalState !== ModalState.SECURITY_KEY_ERROR) {
    return <React.Fragment />;
  }

  /*
   * Event Handlers
   */

  const positiveButton: FooterButtonConfig = {
    content: resources.Action.Dialog.Success,
    label: resources.Action.Dialog.Success,
    enabled: true,
    action: closeModal,
  };

  /*
   * Component Markup
   */

  return (
    <div className="result-security-key-modal">
      <div className="modal-header">
        <div className="modal-modern-header-button" />
        <div className="modal-title">
          <h5>
            <span>{resources.Heading.SomethingWentWrong}</span>
          </h5>
        </div>
      </div>
      <Modal.Body>
        <div className="security-key-description-centered">
          {resources.Description.SecurityKey.SetupError}
        </div>
      </Modal.Body>
      <FragmentModalFooter positiveButton={positiveButton} negativeButton={null} />
    </div>
  );
};
export default ModalSecurityKeyError;
