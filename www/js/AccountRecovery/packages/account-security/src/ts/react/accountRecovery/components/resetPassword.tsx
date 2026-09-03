import React, { useState, useEffect } from "react";
import {
  AccountIntegrityChallengeService,
  AccountSwitcherService,
  DeviceMeta,
  Hybrid,
} from "Roblox";
import { cryptoUtil, hybridResponseService } from "core-roblox-utilities";
import { urlService, httpService } from "core-utilities";
import getInvalidPasswordMessage from "@rbx/authentication-common/utils/passwordValidationUtils";
import useExperiments from "@rbx/authentication-common/hooks/useExperiments";
import AUTH_EVENT_CONSTANTS from "@rbx/authentication-common/constants/eventsConstants";
import ModernCardHeader from "../../common/modernCardComponent/modernCardHeader";
import ModernCardBody from "../../common/modernCardComponent/modernCardBody";
import ModernCardCTARow from "../../common/modernCardComponent/modernCardCTARow";
import useAccountRecoveryContext from "../hooks/useAccountRecoveryContext";
import useRecoveryActions from "../hooks/useRecoveryActions";
import { ProfileSection } from "../commonHelpers";
import { isPasskeyCompatible } from "../../common/compatibility";
import ComponentState from "../store/componentState";
import VariableInputControl from "../../common/variableInputControl";
import { InputValidator, validateEmailAddress } from "../../common/inputControl";
import {
  mapPasswordErrorToResource,
  mapPasswordResetErrorToResource,
} from "../constants/resources";
import {
  CardFooterButtonConfig,
  ModernCardFooter,
} from "../../common/modernCardComponent/modernCardFooter";
import { AccountRecoveryActionType } from "../store/action";
import ModalState from "../store/modalState";
import { PasswordResetError } from "../../../common/request/types/auth";
import { CHALLENGE_CONTAINER_ID } from "../app.config";
import PasskeyUpsellModal from "./modal/passkeyUpsell";

type TwoStepVerificationRequiredError = {
  data: {
    errors: {
      code: number;
      fieldData: string;
      message: string;
      userFacingMessage: string;
    }[];
  };
};

type FieldData = {
  challengeId: string;
};

export const getChallengeIdFromTwoStepVerificationError = (
  error: TwoStepVerificationRequiredError,
): string | null => {
  const fieldDataJSON = error?.data?.errors?.[0]?.fieldData;
  if (typeof fieldDataJSON !== "string") return null;

  try {
    const fieldData = JSON.parse(fieldDataJSON) as FieldData;
    return fieldData?.challengeId || null;
  } catch (parseError) {
    return null;
  }
};

const ResetPassword: React.FC = () => {
  const {
    state: {
      resources,
      eventService,
      requestService,
      recoverySessionId,
      componentStateAndProps,
      userIdToRecover,
      username,
      combinedName,
    },
    dispatch,
  } = useAccountRecoveryContext();

  /*
   * Component State
   */
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const [newEmail, setNewEmail] = useState("");
  const [emailError, setNewEmailError] = useState<string | null>(null);

  const [requestInFlight, setRequestInFlight] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);
  const [showPasskeyInlineCTA, setShowPasskeyInlineCTA] = useState(false);
  const [passkeyRegistered, setPasskeyRegistered] = useState(false);

  // Experiment layer for passkey upsell
  const experimentLayer = "AccountSecurity.SelfRecovery.RecoveryUI";
  const experiments = useExperiments(experimentLayer);
  // Limit this to web only
  const shouldShowPasskeyUpsellAccountRecovery =
    (experiments.shouldShowPasskeyUpsellAccountRecovery as boolean) &&
    DeviceMeta &&
    !DeviceMeta().isInApp;
  const shouldShowOSPasskeyDialogueAutomatically =
    experiments.shouldShowOSPasskeyDialogueAutomatically as boolean;
  const shouldShowPasskeyUpsellModal = experiments.shouldShowPasskeyUpsellModal as boolean;
  const shouldIncludePasskeyUpsellInResetPasswordPage =
    experiments.shouldIncludePasskeyUpsellInResetPasswordPage as boolean;

  const { handleSetupPasskey: hookHandleSetupPasskey } = useRecoveryActions();

  /**
   * Per-component fire-once-per-recoverySessionId guard for the auto-OS-dialog
   * useEffect. See the matching ref in recoveryPasskeyOrPassword.tsx.
   */
  const autoFiredForRecoverySessionIdRef = React.useRef<string | null>(null);

  const isPasskeySupported = React.useCallback((): Promise<boolean> => {
    return isPasskeyCompatible({
      producer: DeviceMeta ?? undefined,
      hybridCallback: () =>
        hybridResponseService.getNativeResponse(
          hybridResponseService.FeatureTarget.CREDENTIALS_PROTOCOL_AVAILABLE,
          {},
          2000,
        ),
    });
  }, []);

  /**
   * Thin wrapper around the shared `useRecoveryActions.handleSetupPasskey`
   * that contributes ResetPassword's local UI state side-effects.
   * The shared hook handles all backend calls, error mapping, telemetry,
   * and in-flight dedup.
   */
  const handleSetupPasskey = React.useCallback(async () => {
    const success = await hookHandleSetupPasskey();
    setShowPasskeyModal(false);
    if (success) {
      setPasskeyRegistered(true);
    }
  }, [hookHandleSetupPasskey]);

  // Check if passkey modal should be shown
  useEffect(() => {
    const checkPasskeyEligibility = async () => {
      if (experiments.isLoading === false && DeviceMeta && !DeviceMeta().isInApp) {
        eventService.sendAuthModalShown(
          AUTH_EVENT_CONSTANTS.state.passkeyUpselling.passkeyUpsellFilteredByInAppTraffic,
        );
      }
      // We don't need the explicit isLoading check here because it defaults to false.
      if (shouldShowPasskeyUpsellAccountRecovery) {
        const supported = await isPasskeySupported();
        if (!supported) {
          eventService.sendAuthModalShown(
            AUTH_EVENT_CONSTANTS.state.passkeyUpselling.passkeyNotSupported,
          );
          return;
        }
        eventService.sendAuthModalShown(
          AUTH_EVENT_CONSTANTS.state.passkeyUpselling.passkeyUpsellShown,
        );
        // This shows in every variant, intentional non if-else
        if (shouldIncludePasskeyUpsellInResetPasswordPage) {
          setShowPasskeyInlineCTA(true);
        }
        if (shouldShowPasskeyUpsellModal) {
          eventService.sendAuthModalShown(
            AUTH_EVENT_CONSTANTS.state.passkeyUpselling.passkeyUpsellModal,
          );
          setShowPasskeyModal(true);
        } else if (shouldShowOSPasskeyDialogueAutomatically && recoverySessionId) {
          // Fire-once-per-recoverySessionId guard: see matching ref in
          // recoveryPasskeyOrPassword.tsx for rationale.
          if (autoFiredForRecoverySessionIdRef.current === recoverySessionId) {
            eventService.sendAuthMsgShown(
              AUTH_EVENT_CONSTANTS.state.passkeyUpselling.passkeyAutoOsDialogueDeduped,
            );
            return;
          }
          autoFiredForRecoverySessionIdRef.current = recoverySessionId;
          await handleSetupPasskey();
        }
      }
    };
    // eslint-disable-next-line no-void
    void checkPasskeyEligibility();
  }, [
    shouldShowPasskeyUpsellAccountRecovery,
    shouldShowPasskeyUpsellModal,
    shouldShowOSPasskeyDialogueAutomatically,
    shouldIncludePasskeyUpsellInResetPasswordPage,
    handleSetupPasskey,
    experiments.isLoading,
    eventService,
    isPasskeySupported,
    recoverySessionId,
  ]);

  /*
   * Event Handlers
   */
  const clearRequestError = () => {
    setRequestError(null);
  };
  const validatePassword: InputValidator = async (value: string) => {
    if (value === "") {
      return null;
    }
    const translationKey = await getInvalidPasswordMessage(value, username ?? undefined);
    return translationKey === "" ? null : mapPasswordErrorToResource(resources, translationKey);
  };
  const validateConfirmPassword = (newPasswordRepeated: string, newPassword: string) => {
    if (newPasswordRepeated === newPassword) {
      return null;
    }
    return resources.Message.PasswordsDoNotMatch;
  };
  const handlePasswordOnChange = (value?: string) => {
    clearRequestError();
    setConfirmPasswordError(validateConfirmPassword(confirmPassword, value ?? ""));
  };

  const handleTwoStepVerificationRequiredError = (
    errorRaw: TwoStepVerificationRequiredError,
    retryRequest: (
      twoStepVerificationChallengeId?: string,
      twoStepVerificationToken?: string,
    ) => Promise<void>,
  ) => {
    const { recoveryResetFlow, recovery2svIncompleteReason } = AUTH_EVENT_CONSTANTS;
    const twoStepVerificationChallengeId = getChallengeIdFromTwoStepVerificationError(errorRaw);
    if (!twoStepVerificationChallengeId || !userIdToRecover) {
      eventService.sendPasswordReset2svIncomplete(
        recoveryResetFlow.control,
        recovery2svIncompleteReason.missingChallengeId,
      );
      setRequestInFlight(false);
      setRequestError(resources.Message.UnknownError);
      return;
    }
    const { TwoStepVerification } = AccountIntegrityChallengeService;
    const rendered = TwoStepVerification.renderChallenge({
      containerId: CHALLENGE_CONTAINER_ID,
      userId: userIdToRecover.toString(),
      challengeId: twoStepVerificationChallengeId,
      actionType: TwoStepVerification.ActionType.PasswordReset,
      shouldShowRememberDeviceCheckbox: false,
      onChallengeCompleted: data => {
        // Challenge completed; re-attempt the request with the solution token.
        // eslint-disable-next-line no-void
        void retryRequest(twoStepVerificationChallengeId, data.verificationToken);
      },
      onChallengeInvalidated: data => {
        // Session expired so we can try again on behalf of the user.
        if (data.errorCode === TwoStepVerification.ErrorCode.SESSION_EXPIRED) {
          // eslint-disable-next-line no-void
          void retryRequest();
        } else {
          // Unknown error; just display the default message.
          eventService.sendPasswordReset2svIncomplete(
            recoveryResetFlow.control,
            recovery2svIncompleteReason.invalidated,
          );
          setRequestInFlight(false);
          setRequestError(resources.Message.UnknownError);
        }
      },
      renderInline: false,
      onModalChallengeAbandoned: () => {
        // Mostly a no-op; just re-render the next time.
        eventService.sendPasswordReset2svIncomplete(
          recoveryResetFlow.control,
          recovery2svIncompleteReason.abandoned,
        );
        setRequestInFlight(false);
      },
    });
    if (!rendered) {
      // Not expected to happen.
      eventService.sendPasswordReset2svIncomplete(
        recoveryResetFlow.control,
        recovery2svIncompleteReason.renderFailed,
      );
      setRequestInFlight(false);
      setRequestError(resources.Message.UnknownError);
    }
  };

  const onPasswordResetSuccess = (accountSwitchingBlob: string, destinationPath?: string) => {
    if (
      DeviceMeta &&
      DeviceMeta().isInApp &&
      (DeviceMeta().isPhone || DeviceMeta().isTablet) &&
      Hybrid?.Overlay
    ) {
      Hybrid.Overlay.close(() => undefined);
      return;
    }

    // having an account switching blob means the user is never autologged in. Go to login page immediately after
    const isLoggedIn = !accountSwitchingBlob && !(DeviceMeta && DeviceMeta().isInApp);
    const redirectUrl = urlService.getAbsoluteUrl(
      isLoggedIn ? (destinationPath ?? "/home") : "/login",
    );
    eventService.sendPasswordResetEvent(recoverySessionId, redirectUrl);
    window.location.href = redirectUrl;
  };

  const executeUpdatePassword = async (
    twoStepVerificationChallengeId?: string,
    twoStepVerificationToken?: string,
  ) => {
    setRequestInFlight(true);
    const accountSwitchingBlob = AccountSwitcherService?.getStoredAccountSwitcherBlob() ?? "";
    const secureAuthenticationIntent = await cryptoUtil.generateSecureAuthIntentV2();
    const resetPasswordResult = await requestService.authApi.resetPassword(
      "RecoverySessionID",
      recoverySessionId,
      userIdToRecover ?? 0,
      password,
      confirmPassword,
      twoStepVerificationChallengeId,
      twoStepVerificationToken,
      accountSwitchingBlob,
      secureAuthenticationIntent,
      undefined,
      undefined,
      newEmail,
    );
    if (resetPasswordResult.isError) {
      // Reset password endpoint is not integrated with GCS so we manually handle the 2sv errors
      if (resetPasswordResult.error === PasswordResetError.TWO_STEP_VERIFICATION_REQUIRED) {
        // 2SV challenge shown — not a terminal failure, so no failure event here.
        handleTwoStepVerificationRequiredError(
          resetPasswordResult.errorRaw as TwoStepVerificationRequiredError,
          executeUpdatePassword,
        );
        return;
      }
      eventService.sendPasswordResetFailure(
        httpService.parseErrorCode(resetPasswordResult.errorRaw),
        resetPasswordResult.errorStatusCode,
        AUTH_EVENT_CONSTANTS.recoveryResetFlow.control,
      );
      setRequestInFlight(false);
      setRequestError(mapPasswordResetErrorToResource(resources, resetPasswordResult.error));
      return;
    }
    eventService.sendPasswordResetSucceeded(AUTH_EVENT_CONSTANTS.recoveryResetFlow.control);
    if (resetPasswordResult.value.shouldPromptCredentialInvalidation) {
      dispatch({
        type: AccountRecoveryActionType.SET_MODAL_STATE,
        modalState: ModalState.INVALIDATE_CREDENTIALS,
        additionalModalProps: {
          shouldPromptPasskeyAddition:
            resetPasswordResult.value.shouldPromptPasskeyAddition ?? false,
          shouldPrompt2svRemoval: resetPasswordResult.value.shouldPrompt2svRemoval ?? false,
          shouldUpdateEmail: resetPasswordResult.value.shouldUpdateEmail,
          updatedEmail: resetPasswordResult.value.recoveryEmail,
          onPasswordResetSuccess: destinationPath => {
            onPasswordResetSuccess(accountSwitchingBlob, destinationPath);
          },
        },
      });
    } else if (resetPasswordResult.value.shouldPromptPasskeyAddition) {
      dispatch({
        type: AccountRecoveryActionType.SET_MODAL_STATE,
        modalState: ModalState.ADD_NEW_PASSKEY,
        additionalModalProps: {
          shouldUpdateEmail: resetPasswordResult.value.shouldUpdateEmail,
          updatedEmail: resetPasswordResult.value.recoveryEmail,
          onPasswordResetSuccess: destinationPath => {
            onPasswordResetSuccess(accountSwitchingBlob, destinationPath);
          },
        },
      });
    } else if (resetPasswordResult.value.shouldPrompt2svRemoval) {
      dispatch({
        type: AccountRecoveryActionType.SET_MODAL_STATE,
        modalState: ModalState.SAVE_OR_DELETE_TWO_STEP_METHOD,
        additionalModalProps: {
          shouldUpdateEmail: resetPasswordResult.value.shouldUpdateEmail,
          updatedEmail: resetPasswordResult.value.recoveryEmail,
          onPasswordResetSuccess: destinationPath => {
            onPasswordResetSuccess(accountSwitchingBlob, destinationPath);
          },
        },
      });
    } else if (resetPasswordResult.value.shouldUpdateEmail) {
      dispatch({
        type: AccountRecoveryActionType.SET_MODAL_STATE,
        modalState: ModalState.UPDATE_EMAIL,
        additionalModalProps: {
          updatedEmail: resetPasswordResult.value.recoveryEmail,
          onPasswordResetSuccess: destinationPath => {
            onPasswordResetSuccess(accountSwitchingBlob, destinationPath);
          },
        },
      });
    } else {
      await requestService.accountRecoveryApi.setEmail(recoverySessionId);
      onPasswordResetSuccess(accountSwitchingBlob);
    }
  };

  /**
   * Public entry for a user-initiated password-reset submit. Emits the
   * per-arm submit event once; 2SV auto-retries re-enter via
   * `executeUpdatePassword` and must not re-emit it.
   */
  const handleUpdatePassword = async () => {
    eventService.sendPasswordResetSubmitted(AUTH_EVENT_CONSTANTS.recoveryResetFlow.control);
    await executeUpdatePassword();
  };

  /*
   * Component Markup
   */
  let shouldAddContactMethod = false;
  if (componentStateAndProps.componentState === ComponentState.RESET_PASSWORD) {
    shouldAddContactMethod = componentStateAndProps.additionalComponentProps.shouldAddContactMethod;
  }
  const passwordValid = password.length > 0 && passwordError === null;
  const confirmPasswordValid = confirmPassword.length > 0 && confirmPasswordError === null;
  const newEmailValid = !shouldAddContactMethod || (newEmail.length > 0 && emailError === null);
  const canSubmit = !requestInFlight && passwordValid && confirmPasswordValid && newEmailValid;

  const bodyText = shouldAddContactMethod
    ? resources.Description.CreateNewPasswordAddEmail
    : resources.Description.CreateNewPassword;
  const updatePasswordButton: CardFooterButtonConfig = {
    content: requestInFlight ? (
      <span className="spin spinner-xs spinner-no-margin" />
    ) : (
      resources.Action.UpdatePassword
    ),
    label: resources.Action.UpdatePassword,
    enabled: canSubmit,
    action: async () => {
      await handleUpdatePassword();
    },
  };
  return (
    <React.Fragment>
      <ModernCardHeader headerText={resources.Heading.ResetPassword} />
      <ModernCardBody>
        <ProfileSection
          userId={userIdToRecover ?? 0}
          combinedName={combinedName ?? ""}
          username={username ?? ""}
        />
        <p className="padding-bottom-large">{bodyText}</p>
        <VariableInputControl
          id="password-input"
          inputType="text"
          label={resources.Label.NewPasswordV2}
          disabled={requestInFlight}
          value={password}
          setValue={setPassword}
          error={passwordError}
          setError={setPasswordError}
          validate={validatePassword}
          canSubmit={canSubmit}
          handleSubmit={handleUpdatePassword}
          onChange={handlePasswordOnChange}
          inputMode="text"
          autoComplete="off"
          placeholder={resources.Label.DoNotUseOldPassword}
          hideFeedback
          phoneSelectorEnabled={false}
          concealInput
          autoFocus
          // debounce validation to avoid making too many validate password calls
          debounceValidation
        />
        <VariableInputControl
          id="confirm-password-input"
          inputType="text"
          label={resources.Label.ConfirmNewPasswordV2}
          disabled={requestInFlight}
          value={confirmPassword}
          setValue={setConfirmPassword}
          error={confirmPasswordError}
          setError={setConfirmPasswordError}
          validate={(value: string) => Promise.resolve(validateConfirmPassword(value, password))}
          canSubmit={canSubmit}
          handleSubmit={handleUpdatePassword}
          onChange={clearRequestError}
          inputMode="text"
          autoComplete="off"
          placeholder=""
          hideFeedback
          phoneSelectorEnabled={false}
          concealInput
          debounceValidation
        />
        {shouldAddContactMethod && (
          <VariableInputControl
            id="new-email-input"
            inputType="text"
            label={resources.Label.AddEmail}
            disabled={requestInFlight}
            value={newEmail}
            setValue={setNewEmail}
            error={emailError}
            setError={setNewEmailError}
            validate={validateEmailAddress(resources.Message.Error.InvalidEmail)}
            canSubmit={canSubmit}
            handleSubmit={handleUpdatePassword}
            onChange={clearRequestError}
            inputMode="email"
            autoComplete="off"
            placeholder=""
            hideFeedback
            phoneSelectorEnabled={false}
          />
        )}
        <p className="text-error xsmall">{requestError}</p>
      </ModernCardBody>
      {showPasskeyInlineCTA && (
        <ModernCardCTARow
          title={resources.Heading.PasskeyUpsellTitle}
          subtitle={resources.Heading.PasskeyUpsellSubtitle}
          buttonText={
            !passkeyRegistered ? resources.Label.AddPasskey : resources.Label.PasskeyAdded
          }
          onButtonClick={async () => {
            await handleSetupPasskey();
            eventService.sendAuthButtonClick(AUTH_EVENT_CONSTANTS.btn.addPasskeyInlineCTA);
          }}
          isButtonEnabled={!passkeyRegistered}
        />
      )}
      <ModernCardFooter positiveButton={updatePasswordButton} negativeButton={null} />
      <PasskeyUpsellModal
        isOpen={showPasskeyModal}
        onClose={() => {
          setShowPasskeyModal(false);
          eventService.sendAuthButtonClick(AUTH_EVENT_CONSTANTS.btn.skipPasskey);
        }}
        onAddPasskey={() => {
          // eslint-disable-next-line no-void
          void handleSetupPasskey();
          eventService.sendAuthButtonClick(AUTH_EVENT_CONSTANTS.btn.addPasskeyModal);
        }}
        resources={resources}
      />
    </React.Fragment>
  );
};
export default ResetPassword;
