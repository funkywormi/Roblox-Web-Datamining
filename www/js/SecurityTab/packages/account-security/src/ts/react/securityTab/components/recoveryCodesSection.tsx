import { authenticatedUser } from "header-scripts";
import React, { useState } from "react";
import { Button } from "@rbx/foundation-ui";
import "../../../../css/tailwind.css";
import useSecurityTabContext from "../hooks/useSecurityTabContext";
import { SecurityTabActionType } from "../store/action";
import ModalState from "../store/modalState";
import EnhancedProtectionDisableWarning from "./modal/enhancedProtectionDisableWarning";

const RecoveryCodesSection: React.FC = () => {
  const {
    state: { resources, recoveryCodeStatus, requestService },
    dispatch,
  } = useSecurityTabContext();

  const [clearWarningOpen, setClearWarningOpen] = useState(false);

  const codesExist = recoveryCodeStatus.activeCount > 0;

  const generateRecoveryCodes = () => {
    dispatch({
      type: SecurityTabActionType.SET_MODAL_STATE,
      modalState: ModalState.RECOVERY_CODES_GENERATE,
      additionalModalProps: null,
    });
  };

  const onClearConfirm = async () => {
    const result = await requestService.twoStepVerification.clearRecoveryCodes(
      authenticatedUser.id!.toString(),
    );
    setClearWarningOpen(false);
    if (!result.isError) {
      dispatch({
        type: SecurityTabActionType.SET_RECOVERY_CODE_STATUS,
        recoveryCodeStatus: { activeCount: 0, created: null },
      });
    }
  };

  const recoveryCodeCountText = (
    <span id="generate-recovery-codes-count">
      {resources.Label.UnusedRecoveryCodes(recoveryCodeStatus.activeCount)}
    </span>
  );

  const clearWarningModal = (
    <EnhancedProtectionDisableWarning
      open={clearWarningOpen}
      setOpen={setClearWarningOpen}
      modalTitleText={resources.Heading.ClearRecoveryCodes}
      modalBodyText={resources.Description.ClearRecoveryCodesWarning}
      modalCancelButtonText={resources.Label.Cancel}
      modalTurnOffButtonText={resources.Action.Delete}
      onConfirm={() => {
        onClearConfirm().catch(() => {
          setClearWarningOpen(false);
        });
      }}
    />
  );

  return (
    <div className="recovery-codes-wrapper" data-testid="recovery-codes-section">
      {clearWarningModal}
      <div
        className="section-content notifications-section"
        style={{
          marginBottom: "12px",
        }}
      >
        <div style={{ marginBottom: "12px" }}>
          <h4 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
            {resources.Heading.RecoveryCodesGenerated}
          </h4>
        </div>
        <div style={{ marginBottom: "12px" }}>
          <div id="generate-recover-codes-description" className="text-description">
            {resources.Label.RecoveryCodesHelpText}
            {codesExist && <span> {recoveryCodeCountText}</span>}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
          <Button
            size="Medium"
            variant="Standard"
            id="generate-recovery-codes"
            data-testid="generate-recovery-codes"
            onClick={generateRecoveryCodes}
          >
            {codesExist ? resources.Action.CreateAgain : resources.Action.Create}
          </Button>
          {codesExist && (
            <Button
              size="Medium"
              variant="Alert"
              id="clear-recovery-codes"
              data-testid="clear-recovery-codes"
              onClick={() => setClearWarningOpen(true)}
            >
              {resources.Action.Delete}
            </Button>
          )}
        </div>
      </div>
      <div className="rbx-divider" style={{ marginBottom: "12px" }} />
    </div>
  );
};

export default RecoveryCodesSection;
