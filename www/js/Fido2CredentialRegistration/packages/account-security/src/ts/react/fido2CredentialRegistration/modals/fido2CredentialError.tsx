import React, { useEffect } from "react";
import { Modal } from "react-style-guide";
import { ModalFragmentProps } from "../constants/types";
import useFido2CredentialRegistrationContext from "../hooks/useFido2CredentialRegistrationContext";
import ModalState from "../store/modalState";
import { FooterButtonConfig, FragmentModalFooter } from "../../common/modalFooter";
import { Fido2CredentialRegistrationActionType } from "../store/action";

const ModalFido2CredentialError: React.FC<ModalFragmentProps> = ({
  closeModal,
}: ModalFragmentProps) => {
  const {
    state: { eventService, translate, modalStateAndProps },
    dispatch,
  } = useFido2CredentialRegistrationContext();

  useEffect(() => {
    eventService.sendOSDialogErrorEvent();
  }, []);

  // This case should never happen.
  if (modalStateAndProps.modalState !== ModalState.FIDO_CREDENTIAL_ERROR) {
    return <React.Fragment />;
  }

  const onTryAgain = () => {
    dispatch({
      type: Fido2CredentialRegistrationActionType.SET_MODAL_STATE,
      modalState: ModalState.FIDO_CREDENTIAL_ENABLE,
      additionalModalProps: null,
    });
  };
  /*
   * Event Handlers
   */

  const positiveButton: FooterButtonConfig = {
    content: translate("Action.TryAgain"),
    label: translate("Action.TryAgain"),
    enabled: true,
    action: onTryAgain,
  };

  /*
   * Component Markup
   */

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
            <span>{translate("Heading.SomethingWentWrong")}</span>
          </h4>
        </div>
      </div>
      <Modal.Body>
        <div className="fido-credential-description-centered">
          {translate("Description.UnableToSaveChanges")}
        </div>
      </Modal.Body>
      <FragmentModalFooter positiveButton={positiveButton} negativeButton={null} />
    </div>
  );
};
export default ModalFido2CredentialError;
