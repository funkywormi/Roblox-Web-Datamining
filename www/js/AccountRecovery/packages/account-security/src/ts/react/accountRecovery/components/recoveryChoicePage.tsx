import React, { useState, useEffect } from "react";
import { Button } from "@rbx/foundation-ui";
import AUTH_EVENT_CONSTANTS from "@rbx/authentication-common/constants/eventsConstants";
import useAccountRecoveryContext from "../hooks/useAccountRecoveryContext";
import useRecoveryActions from "../hooks/useRecoveryActions";
import ComponentState from "../store/componentState";
import { AccountRecoveryActionType } from "../store/action";
import { RecoveryState } from "../../../common/request/types/accountRecovery";

const RecoveryChoicePage: React.FC = () => {
  const { dispatch } = useAccountRecoveryContext();
  const {
    handleSetupPasskey,
    performAutoLoginAfterPasskey,
    dispatchRecoverySuccessWithLoginRedirect,
    isPasskeySupported,
    shouldShowAutoOSPasskeyDialogue,
    shouldAddContactMethod,
    userIdToRecover,
    username,
    recoverySessionId,
    resources,
    eventService,
  } = useRecoveryActions();
  const [requestInFlight, setRequestInFlight] = useState(false);

  /**
   * Per-component fire-once guard for the auto-OS-dialog useEffect.
   * See the matching ref in recoveryPasskeyOrPassword.tsx for rationale.
   */
  const autoFiredForRecoverySessionIdRef = React.useRef<string | null>(null);

  /**
   * Navigate to the password reset page, carrying the same recovery session
   * (recoverySessionId is preserved by the reducer — a failed passkey does not
   * consume it) so the user can finish recovery with a password.
   */
  const navigateToPasswordReset = () => {
    dispatch({
      type: AccountRecoveryActionType.SET_COMPONENT_STATE,
      recoverySessionState: RecoveryState.AccountVerified,
      componentState: ComponentState.RESET_PASSWORD,
      additionalComponentProps: {
        shouldAddContactMethod,
        cameFromChoicePage: true,
      },
    });
  };

  const handleCreatePasskey = async () => {
    setRequestInFlight(true);
    const success = await handleSetupPasskey();
    if (!success) {
      setRequestInFlight(false);
      // Passkey ceremony failed (OS-prompt cancel, error, etc). Rather than
      // leaving the user stranded on the choice page route them to password
      // recovery so they have a guaranteed path
      navigateToPasswordReset();
      return;
    }

    const autoLoginResult = await performAutoLoginAfterPasskey();

    if (autoLoginResult === "success") {
      return;
    }

    dispatchRecoverySuccessWithLoginRedirect();
  };

  useEffect(() => {
    if (!shouldShowAutoOSPasskeyDialogue || !userIdToRecover || !username || !recoverySessionId) {
      return;
    }
    if (autoFiredForRecoverySessionIdRef.current === recoverySessionId) {
      eventService.sendAuthMsgShown(
        AUTH_EVENT_CONSTANTS.state.passkeyUpselling.passkeyAutoOsDialogueDeduped,
      );
      return;
    }
    autoFiredForRecoverySessionIdRef.current = recoverySessionId;
    const triggerAutoOSDialog = async () => {
      const supported = await isPasskeySupported();
      if (supported) {
        // eslint-disable-next-line no-void
        void handleCreatePasskey();
      }
    };
    // eslint-disable-next-line no-void
    void triggerAutoOSDialog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldShowAutoOSPasskeyDialogue, userIdToRecover, username, recoverySessionId]);

  const handlePasskeyButtonClick = () => {
    eventService.sendRecoveryPathChosenEvent(AUTH_EVENT_CONSTANTS.field.recoveryPasskey);
    // eslint-disable-next-line no-void
    void handleCreatePasskey();
  };

  const handleResetPassword = () => {
    eventService.sendRecoveryPathChosenEvent(AUTH_EVENT_CONSTANTS.field.recoveryPassword);
    navigateToPasswordReset();
  };

  return (
    <React.Fragment>
      <h1 className="text-heading-large text-center padding-bottom-medium">
        {resources.Heading.ProtectYourAccount}
      </h1>
      <div className="flex flex-col padding-medium gap-small" data-testid="recovery-choice-page">
        <p className="text-center text-body-large padding-bottom-large">
          {resources.Description.ChooseSecurityMethod}
        </p>
        <Button
          variant="Emphasis"
          size="Large"
          className="fill"
          isDisabled={requestInFlight}
          isLoading={requestInFlight}
          onClick={handlePasskeyButtonClick}
          data-testid="recovery-choice-add-passkey"
        >
          {resources.Label.AddPasskey}
        </Button>
        <Button
          variant="Standard"
          size="Large"
          className="fill"
          isDisabled={requestInFlight}
          onClick={handleResetPassword}
          data-testid="recovery-choice-create-password"
        >
          {resources.Action.CreateNewPassword}
        </Button>
      </div>
    </React.Fragment>
  );
};

export default RecoveryChoicePage;
