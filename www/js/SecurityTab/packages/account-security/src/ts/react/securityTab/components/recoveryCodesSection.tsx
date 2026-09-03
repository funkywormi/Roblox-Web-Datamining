import { DeviceMeta } from "Roblox";
import { authenticatedUser } from "header-scripts";
import React, { useState } from "react";
import { Button } from "@rbx/foundation-ui";
import "../../../../css/tailwind.css";
import useSecurityTabContext from "../hooks/useSecurityTabContext";
import useRedesignFlags from "../hooks/useRedesignFlags";
import { SecurityTabActionType } from "../store/action";
import ModalState from "../store/modalState";
import EnhancedProtectionDisableWarning from "./modal/enhancedProtectionDisableWarning";

const RecoveryCodesSection: React.FC = () => {
  const {
    state: { resources, recoveryCodeStatus, requestService },
    dispatch,
  } = useSecurityTabContext();

  const { isRedesignEnabled } = useRedesignFlags();
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

  const isMobile = DeviceMeta && DeviceMeta().isPhone;

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
      modalTurnOffButtonText={isRedesignEnabled ? resources.Action.Delete : resources.Action.Clear}
      onConfirm={() => {
        onClearConfirm().catch(() => {
          setClearWarningOpen(false);
        });
      }}
    />
  );

  if (isRedesignEnabled) {
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
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}
          >
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
  }

  const generateButton = (
    <button
      type="button"
      id="generate-recovery-codes"
      className="btn-control-sm acct-settings-btn"
      aria-describedby="generate-recovery-codes-count generate-recover-codes-description"
      onClick={generateRecoveryCodes}
    >
      {resources.Action.Generate}
    </button>
  );

  const clearButton = codesExist ? (
    <button
      type="button"
      id="clear-recovery-codes"
      className="btn-control-sm acct-settings-btn"
      onClick={() => setClearWarningOpen(true)}
    >
      {resources.Action.Clear}
    </button>
  ) : null;

  return (
    <div className="section-content notifications-section" data-testid="recovery-codes-section">
      {clearWarningModal}
      <div className="security-2svsetting-label btn-toggle-label">
        <div className="recovery-codes-heading">
          {!codesExist ? (
            <div className="btn-toggle-label" style={{ display: "inline-block" }}>
              {resources.Label.GenerateRecoveryCodes}
            </div>
          ) : (
            <div className="btn-toggle-label-new-codes">
              <div className="label-new-codes">{resources.Label.GenerateNewRecoveryCodes}</div>
              <div className="text-number-of-remaining-codes">
                <span className="small text">{recoveryCodeCountText}</span>
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: "8px" }}>
            {generateButton}
            {clearButton}
          </div>
        </div>
        {isMobile && (
          <React.Fragment>
            <br />
            <br />
          </React.Fragment>
        )}
        <div className="rbx-divider" />
        <div id="generate-recover-codes-description" className="text-description">
          {resources.Label.RecoveryCodesHelpText}
        </div>
      </div>
    </div>
  );
};

export default RecoveryCodesSection;
