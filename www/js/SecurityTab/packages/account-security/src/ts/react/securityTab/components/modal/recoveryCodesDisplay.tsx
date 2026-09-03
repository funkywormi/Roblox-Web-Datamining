import React, { useState } from "react";
import { Modal } from "react-style-guide";
import { authenticatedUser } from "header-scripts";
import { ModalFragmentProps } from "../../constants/types";
import useSecurityTabContext from "../../hooks/useSecurityTabContext";
import ModalState from "../../store/modalState";
import { SecurityTabActionType } from "../../store/action";

const ModalRecoveryCodesDisplay: React.FC<ModalFragmentProps> = ({
  closeModal,
}: ModalFragmentProps) => {
  const {
    state: { resources, requestService, modalStateAndProps },
    dispatch,
  } = useSecurityTabContext();

  /*
   * Component State
   */
  const [confirmSavedCodes, setConfirmSavedCodes] = useState<boolean>(false);

  /*
   * Effects
   */

  // This case should never happen.
  if (modalStateAndProps.modalState !== ModalState.RECOVERY_CODES_DISPLAY) {
    return <React.Fragment />;
  }

  /*
   * Event Handlers
   */

  const checkboxToggle = () => {
    setConfirmSavedCodes(!confirmSavedCodes);
  };

  const updateStateAndCloseModal = async () => {
    const getRecoveryCodesStatusResult =
      await requestService.twoStepVerification.getRecoveryCodesStatus(
        authenticatedUser.id!.toString(),
      );
    if (getRecoveryCodesStatusResult.isError) {
      dispatch({
        type: SecurityTabActionType.SET_RECOVERY_CODE_STATUS,
        recoveryCodeStatus: {
          activeCount: 0,
          created: null,
        },
      });
      return;
    }
    dispatch({
      type: SecurityTabActionType.SET_RECOVERY_CODE_STATUS,
      recoveryCodeStatus: getRecoveryCodesStatusResult.value,
    });

    closeModal();

    const shouldProceedToSecurityKey =
      modalStateAndProps.additionalModalProps?.onRecoveryCodesComplete;
    if (shouldProceedToSecurityKey) {
      shouldProceedToSecurityKey();
    }
  };

  /*
   * Component Markup
   */

  const recoveryCodesDisplayElement = (recoveryCodes: string[]) => {
    const recoveryCodesLeft = recoveryCodes.slice(0, recoveryCodes.length / 2).join("\n");
    const recoveryCodesRight = recoveryCodes.slice(recoveryCodes.length / 2).join("\n");
    return (
      <React.Fragment>
        <pre className="recovery-codes-list text-secondary">{recoveryCodesLeft}</pre>
        <pre className="recovery-codes-list text-secondary">{recoveryCodesRight}</pre>
      </React.Fragment>
    );
  };

  return (
    <div className="recovery-codes-modal">
      <div className="modal-header">
        <div className="modal-modern-header-button" />
        <div className="modal-title">
          <h5>
            <span>{resources.Heading.RecoveryCodesGenerated}</span>
          </h5>
        </div>
      </div>

      <Modal.Body>
        <div>
          <div className="body-text text-description">
            {resources.Description.Dialog.RecoveryCodesGenerated}
          </div>
          <br />
          <div className="section-content-off recovery-codes-container">
            {recoveryCodesDisplayElement(modalStateAndProps.additionalModalProps.recoveryCodes)}
          </div>
          <br />
          <div className="checkbox">
            <input id="confirm-recovery-codes-checkbox" type="checkbox" onClick={checkboxToggle} />
            <label htmlFor="confirm-recovery-codes-checkbox">
              {resources.Label.Dialog.RecoveryCodesSavedConfirmation}
            </label>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button
          type="submit"
          className="btn-secondary-md btn-full-width"
          onClick={updateStateAndCloseModal}
          disabled={!confirmSavedCodes}
        >
          {resources.Action.Dialog.Close}
        </button>
      </Modal.Footer>
    </div>
  );
};
export default ModalRecoveryCodesDisplay;
