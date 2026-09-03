import React from "react";
import { Modal } from "react-style-guide";
import { authenticatedUser } from "header-scripts";
import { AccountIntegrityChallengeService } from "Roblox";
import { ModalFragmentProps } from "../../constants/types";
import useSecurityTabContext from "../../hooks/useSecurityTabContext";
import ModalState from "../../store/modalState";
import { SecurityTabActionType } from "../../store/action";
import { mapTwoStepVerificationErrorToResource } from "../../constants/resources";
import { MediaType } from "../../../challenge/twoStepVerification";

const ModalSecurityKeyDelete: React.FC<ModalFragmentProps> = ({
  closeModal,
}: ModalFragmentProps) => {
  const {
    state: { resources, requestService, modalStateAndProps },
    dispatch,
  } = useSecurityTabContext();

  // This case should never happen.
  if (modalStateAndProps.modalState !== ModalState.SECURITY_KEY_DELETE) {
    return <React.Fragment />;
  }

  /*
   * Event Handlers
   */

  const deleteKey = async () => {
    const deleteSecurityKeyResult = await requestService.twoStepVerification.deleteSecurityKey(
      authenticatedUser.id!.toString(),
      modalStateAndProps.additionalModalProps.keysToDeleteNames,
    );
    if (deleteSecurityKeyResult.isError) {
      const { Generic } = AccountIntegrityChallengeService;
      if (Generic.ChallengeError.matchAbandoned(deleteSecurityKeyResult.errorRaw)) {
        // We ignore this error because it's triggered by the user abandoning a GCS challenge.
        // The user should be able to try the challenge again without a visible error.
        closeModal();
        return;
      }
      dispatch({
        type: SecurityTabActionType.SET_MODAL_STATE,
        modalState: ModalState.GENERIC_TEXT_ERROR,
        additionalModalProps: {
          title: resources.Heading.Dialog.DefaultError,
          body: mapTwoStepVerificationErrorToResource(resources, deleteSecurityKeyResult.error),
          button: resources.Action.Dialog.Success,
        },
      });
      return;
    }

    if (modalStateAndProps.additionalModalProps.deletedAllKeys) {
      dispatch({
        type: SecurityTabActionType.DISABLE_MEDIA_TYPE,
        mediaType: MediaType.SecurityKey,
      });
    }

    dispatch({
      type: SecurityTabActionType.SET_MODAL_STATE,
      modalState: ModalState.SECURITY_KEY_DELETE_SUCCESS,
      additionalModalProps: {
        deletedKeys: modalStateAndProps.additionalModalProps.keysToDeleteNames,
      },
    });
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
            <span>{resources.Heading.DeleteSecurityKey}</span>
          </h5>
        </div>
      </div>
      <Modal.Body>
        <div className="security-key-description-centered">
          {resources.Description.SecurityKey.Deletion}
        </div>
        <div className="security-key-description-centered">
          {resources.Description.SecurityKey.Warning}
        </div>
      </Modal.Body>
      <div className="modal-footer">
        <div className="security-key-dual-button-container">
          <button
            type="submit"
            className="btn-cta-md btn-full-width"
            style={{
              display: "inline",
            }}
            onClick={closeModal}
          >
            {resources.Label.Cancel}
          </button>

          <button
            type="submit"
            className="btn-cta-md btn-full-width"
            style={{
              display: "inline",
            }}
            onClick={deleteKey}
          >
            {resources.Action.DeleteSecurityKey}
          </button>
        </div>
      </div>
    </div>
  );
};
export default ModalSecurityKeyDelete;
