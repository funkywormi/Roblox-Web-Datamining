import React, { Fragment } from "react";
import { Modal } from "react-style-guide";
import { Button } from "@rbx/foundation-ui";
import useAccountRecoveryContext from "../../hooks/useAccountRecoveryContext";
import ModalState from "../../store/modalState";

// Where the extra layers of protection the copy refers to — Enhanced
// Protection, passkeys, 2SV — are all managed.
const SECURITY_SETTINGS_PATH = "/my/account#!/security";

/**
 * Terminal confirmation shown after the user opts to delete the changes an
 * attacker made. Both buttons end the recovery flow through
 * `onPasswordResetSuccess`, which owns the completion event and the in-app /
 * account-switching hand-offs; the upsell only asks it for a different landing
 * page, and is honored when the reset left the user logged in.
 */
const ModalAccountSecured: React.FC = () => {
  const {
    state: { modalStateAndProps, resources },
  } = useAccountRecoveryContext();

  if (modalStateAndProps.modalState !== ModalState.ACCOUNT_SECURED) {
    return <Fragment />;
  }

  const { onPasswordResetSuccess } = modalStateAndProps.additionalModalProps;

  return (
    <div data-testid="account-secured-modal">
      <Modal.Body>
        <div className="recovery-confirmation-body">
          <span className="text-heading-small content-emphasis">
            {resources.Heading.AccountSecuredConfirmation}
          </span>
          <span className="text-body-medium content-muted">
            {resources.Description.AccountSecuredConfirmationWeb}
          </span>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="modal-modern-footer-buttons">
          <Button
            variant="Standard"
            size="Medium"
            className="modal-modern-footer-button"
            onClick={() => onPasswordResetSuccess()}
          >
            {resources.Action.Ok}
          </Button>
          <Button
            variant="Emphasis"
            size="Medium"
            className="modal-modern-footer-button"
            onClick={() => onPasswordResetSuccess(SECURITY_SETTINGS_PATH)}
          >
            {resources.Action.AddProtection}
          </Button>
        </div>
      </Modal.Footer>
    </div>
  );
};

export default ModalAccountSecured;
