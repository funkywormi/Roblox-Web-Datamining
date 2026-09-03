import React, { useEffect } from "react";
import { Button, TextInput } from "@rbx/foundation-ui";
import AUTH_EVENT_CONSTANTS from "@rbx/authentication-common/constants/eventsConstants";
import useRecoveryActions from "../hooks/useRecoveryActions";

type RecoveryPasskeyOrPasswordProps = {
  layout?: "passkey-first" | "password-first";
};

const RecoveryPasskeyOrPassword: React.FC<RecoveryPasskeyOrPasswordProps> = ({
  layout = "passkey-first",
}) => {
  const {
    handleSetupPasskey,
    performAutoLoginAfterPasskey,
    dispatchRecoverySuccessWithLoginRedirect,
    isPasskeySupported,
    shouldShowAutoOSPasskeyDialogue,
    resources,
    recoverySessionId,
    userIdToRecover,
    username,
    password,
    passwordError,
    confirmPassword,
    confirmPasswordError,
    requestInFlight,
    setRequestInFlight,
    requestError,
    handlePasswordChange,
    handleConfirmPasswordChange,
    callResetPassword,
    canSubmitPassword,
    shouldAddContactMethod,
    emailError,
    handleEmailChange,
    eventService,
  } = useRecoveryActions();

  /**
   * Per-component fire-once-per-recoverySessionId guard for the auto-OS-dialog
   * useEffect. Stores the recoverySessionId we have already auto-fired for,
   * so successive useEffect runs do not re-trigger the passkey ceremony for
   * the same session.
   */
  const autoFiredForRecoverySessionIdRef = React.useRef<string | null>(null);

  const handlePasskeyFlow = async () => {
    setRequestInFlight(true);
    const success = await handleSetupPasskey();
    if (!success) {
      setRequestInFlight(false);
      return;
    }

    const autoLoginResult = await performAutoLoginAfterPasskey();

    if (autoLoginResult === "success") {
      return;
    }

    dispatchRecoverySuccessWithLoginRedirect();
  };

  const handlePasskeyClick = async () => {
    if (layout === "passkey-first") {
      eventService.sendRecoveryPathChosenEvent(AUTH_EVENT_CONSTANTS.field.recoveryPasskey);
    }
    await handlePasskeyFlow();
  };

  useEffect(() => {
    if (
      layout !== "passkey-first" ||
      !shouldShowAutoOSPasskeyDialogue ||
      !userIdToRecover ||
      !username ||
      !recoverySessionId
    ) {
      return;
    }
    // Fire-once-per-recoverySessionId guard: if dep churn re-runs this
    // effect for a recoverySessionId we have already auto-fired for,
    // suppress the duplicate ceremony and emit telemetry.
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
        void handlePasskeyFlow();
      }
    };
    // eslint-disable-next-line no-void
    void triggerAutoOSDialog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldShowAutoOSPasskeyDialogue, userIdToRecover, username, recoverySessionId]);

  const handlePasswordSubmit = async () => {
    if (layout === "passkey-first") {
      eventService.sendRecoveryPathChosenEvent(AUTH_EVENT_CONSTANTS.field.recoveryPassword);
    }
    await callResetPassword(
      layout === "passkey-first"
        ? AUTH_EVENT_CONSTANTS.recoveryResetFlow.passkeyFirst
        : AUTH_EVENT_CONSTANTS.recoveryResetFlow.passwordFirst,
    );
  };

  const isPasskeyFirst = layout === "passkey-first";

  const passkeySection = (
    <Button
      variant={isPasskeyFirst ? "Emphasis" : "Standard"}
      size="Large"
      className="fill"
      isDisabled={requestInFlight}
      isLoading={requestInFlight}
      onClick={handlePasskeyClick}
    >
      {resources.Label.AddPasskey}
    </Button>
  );

  const passwordSection = (
    <React.Fragment>
      <div className="flex flex-col gap-small padding-bottom-small">
        <TextInput
          className="[&_label]:text-body-small [&_input]:bg-action-utility"
          label={resources.Label.NewPasswordV2}
          placeholder={resources.Label.DoNotUseOldPassword}
          type="password"
          error={passwordError ?? undefined}
          onChange={ev => handlePasswordChange(ev.currentTarget.value)}
          isDisabled={requestInFlight}
        />
        {!passwordError && <span className="height-350" />}
      </div>
      <div className="flex flex-col gap-small padding-bottom-medium">
        <TextInput
          className="[&_label]:text-body-small [&_input]:bg-action-utility"
          label={resources.Label.ConfirmNewPasswordV2}
          type="password"
          error={confirmPasswordError ?? undefined}
          onChange={ev => handleConfirmPasswordChange(ev.currentTarget.value)}
          isDisabled={requestInFlight}
        />
        {!confirmPasswordError && <span className="height-350" />}
      </div>

      {shouldAddContactMethod && (
        <div className="flex flex-col gap-small padding-bottom-medium">
          <TextInput
            className="[&_label]:text-body-small [&_input]:bg-action-utility"
            label={resources.Label.AddEmail}
            placeholder=""
            type="email"
            error={emailError ?? undefined}
            onChange={ev => handleEmailChange(ev.currentTarget.value)}
            isDisabled={requestInFlight}
          />
          {!emailError && <span className="height-350" />}
        </div>
      )}

      {requestError && <p className="text-error text-body-small">{requestError}</p>}

      <Button
        variant="Emphasis"
        size="Large"
        className="fill"
        isDisabled={!canSubmitPassword}
        isLoading={requestInFlight}
        onClick={handlePasswordSubmit}
      >
        {resources.Action.UpdatePassword}
      </Button>
    </React.Fragment>
  );

  const divider = (
    <div className="flex items-center gap-large padding-y-large">
      <div className="rbx-divider fill" />
      <span className="text-label-medium">{resources.Label.Or}</span>
      <div className="rbx-divider fill" />
    </div>
  );

  const bodyText = isPasskeyFirst
    ? resources.Description.AddPasskeyOrCreatePassword
    : resources.Description.CreatePasswordOrAddPasskey;

  return (
    <React.Fragment>
      <h1 className="text-heading-large text-center padding-bottom-medium">
        {resources.Heading.ProtectYourAccount}
      </h1>
      <div className="flex flex-col padding-medium">
        <p className="text-center text-body-large padding-bottom-xxlarge">{bodyText}</p>
        {isPasskeyFirst ? (
          <React.Fragment>
            {passkeySection}
            {divider}
            {passwordSection}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {passwordSection}
            {divider}
            {passkeySection}
          </React.Fragment>
        )}
      </div>
    </React.Fragment>
  );
};

export default RecoveryPasskeyOrPassword;
