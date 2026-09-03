import React, { Fragment } from "react";
import { Modal } from "react-style-guide";
import { Button } from "@rbx/foundation-ui";
import useAccountRecoveryContext from "../../hooks/useAccountRecoveryContext";
import ModalState from "../../store/modalState";
import { AccountRecoveryActionType } from "../../store/action";

const SECURITY_SETTINGS_PATH = "/my/account#!/security";

/**
 * Terminal confirmation shown after the user opts to keep the changes an
 * attacker made. Acknowledging it continues through any remaining
 * post-recovery prompts, then hands the user off to security settings.
 */
const ModalNoChangesMade: React.FC = () => {
  const {
    state: { modalStateAndProps, resources },
    dispatch,
  } = useAccountRecoveryContext();

  if (modalStateAndProps.modalState !== ModalState.NO_CHANGES_MADE) {
    return <Fragment />;
  }

  const {
    shouldPromptPasskeyAddition,
    shouldPrompt2svRemoval,
    shouldUpdateEmail,
    updatedEmail,
    onPasswordResetSuccess,
  } = modalStateAndProps.additionalModalProps;

  const redirectToSecuritySettings = () => {
    onPasswordResetSuccess(SECURITY_SETTINGS_PATH);
  };

  // Mirrors the ordering in RecoverySuccess, or finishes if nothing is pending.
  const handleContinue = () => {
    if (shouldPromptPasskeyAddition) {
      dispatch({
        type: AccountRecoveryActionType.SET_MODAL_STATE,
        modalState: ModalState.ADD_NEW_PASSKEY,
        additionalModalProps: {
          shouldUpdateEmail,
          updatedEmail,
          onPasswordResetSuccess: redirectToSecuritySettings,
        },
      });
      return;
    }

    if (shouldPrompt2svRemoval) {
      dispatch({
        type: AccountRecoveryActionType.SET_MODAL_STATE,
        modalState: ModalState.SAVE_OR_DELETE_TWO_STEP_METHOD,
        additionalModalProps: {
          shouldUpdateEmail,
          updatedEmail,
          onPasswordResetSuccess: redirectToSecuritySettings,
        },
      });
      return;
    }

    if (shouldUpdateEmail) {
      dispatch({
        type: AccountRecoveryActionType.SET_MODAL_STATE,
        modalState: ModalState.UPDATE_EMAIL,
        additionalModalProps: {
          updatedEmail: updatedEmail ?? "",
          onPasswordResetSuccess: redirectToSecuritySettings,
        },
      });
      return;
    }

    redirectToSecuritySettings();
  };

  return (
    <div data-testid="no-changes-made-modal">
      <Modal.Body>
        <div className="recovery-confirmation-body">
          <span className="text-heading-small content-emphasis">
            {resources.Heading.NoChangesMade}
          </span>
          <span className="text-body-medium content-muted">
            {resources.Description.NoChangesMade}
          </span>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="modal-modern-footer-buttons">
          <Button
            variant="Emphasis"
            size="Medium"
            className="modal-modern-footer-button"
            onClick={handleContinue}
          >
            {resources.Action.Ok}
          </Button>
        </div>
      </Modal.Footer>
    </div>
  );
};

export default ModalNoChangesMade;
