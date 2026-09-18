import React, { useState } from "react";
import { Modal } from "react-style-guide";
import { authenticatedUser } from "header-scripts";
import { Button } from "@rbx/foundation-ui";
import { ModalFragmentProps } from "../../constants/types";
import useSecurityTabContext from "../../hooks/useSecurityTabContext";
import ModalState from "../../store/modalState";
import { SecurityTabActionType } from "../../store/action";

const ModalRecoveryCodesDisplay: React.FC<ModalFragmentProps> = ({
  closeModal,
}: ModalFragmentProps) => {
  const {
    state: { resources, requestService, modalStateAndProps, systemFeedbackService, eventService },
    dispatch,
  } = useSecurityTabContext();

  /*
   * Component State
   */
  const [hasCopied, setHasCopied] = useState<boolean>(false);
  const [hasDownloaded, setHasDownloaded] = useState<boolean>(false);

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

  const handleCopy = async () => {
    const allRecoveryCodes = modalStateAndProps.additionalModalProps.recoveryCodes.join("\n");
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(allRecoveryCodes);
        systemFeedbackService.success(resources.Message.RecoveryCodesCopied);
        eventService.sendRecoveryCodesCopyEvent();
      }
    } catch {
      systemFeedbackService.warning(resources.Message.RecoveryCodesNotCopied);
    } finally {
      setHasCopied(true);
    }
  };

  const handleDownload = () => {
    const allRecoveryCodes = modalStateAndProps.additionalModalProps.recoveryCodes.join("\n");
    const blob = new Blob([allRecoveryCodes], { type: "text/plain;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "roblox_backup_codes.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(url), 0);
    eventService.sendRecoveryCodesDownloadEvent();
    setHasDownloaded(true);
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
          <div className="recovery-codes-actions" data-testid="recovery-codes-actions">
            <Button
              variant="Emphasis"
              size="Medium"
              icon="icon-regular-arrow-down-to-line"
              className="flex-col fill"
              data-testid="recovery-codes-download-button"
              onClick={handleDownload}
            >
              {resources.Action.Download}
            </Button>
            <Button
              variant="Standard"
              size="Medium"
              icon="icon-regular-clipboard-pencil"
              className="flex-col fill"
              data-testid="recovery-codes-copy-button"
              onClick={handleCopy}
            >
              {resources.Action.Copy}
            </Button>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button
          type="submit"
          className="btn-secondary-md btn-full-width"
          data-testid="recovery-codes-close-button"
          onClick={updateStateAndCloseModal}
          disabled={!hasCopied && !hasDownloaded}
        >
          {resources.Action.Dialog.Close}
        </button>
      </Modal.Footer>
    </div>
  );
};
export default ModalRecoveryCodesDisplay;
