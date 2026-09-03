import React, { useState } from "react";
import {
  AccountIntegrityChallengeService,
  AccountSwitcherService,
  DeviceMeta,
  Hybrid,
} from "Roblox";
import { cryptoUtil, fido2Util, hybridResponseService } from "core-roblox-utilities";
import { urlService, httpService } from "core-utilities";
import getInvalidPasswordMessage from "@rbx/authentication-common/utils/passwordValidationUtils";
import useExperiments from "@rbx/authentication-common/hooks/useExperiments";
import AUTH_EVENT_CONSTANTS from "@rbx/authentication-common/constants/eventsConstants";
import useAccountRecoveryContext from "./useAccountRecoveryContext";
import { isPasskeyCompatible } from "../../common/compatibility";
import {
  startPreAuthPasskeyRegistration,
  finishARPreAuthPasskeyRegistration,
  PasswordDeletionSource,
} from "../../../common/request/apis/auth";
import { PasswordResetError } from "../../../common/request/types/auth";
import {
  mapPasswordErrorToResource,
  mapPasswordResetErrorToResource,
} from "../constants/resources";
import { getChallengeIdFromTwoStepVerificationError } from "../commonHelpers";
import { isValidEmail } from "../../common/inputControl";
import { CHALLENGE_CONTAINER_ID } from "../app.config";
import { AccountRecoveryActionType } from "../store/action";
import ComponentState from "../store/componentState";
import { RecoveryState } from "../../../common/request/types/accountRecovery";

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

const EXPERIMENT_LAYER = "AccountSecurity.SelfRecovery.RecoveryUI";
const AUTO_LOGIN_RETRY_DELAY_MS = 1000;

/**
 * Best-effort extraction of a WebAuthn failure cause for telemetry. Prefers the
 * DOMException `name` (e.g. NotAllowedError, InvalidStateError, SecurityError,
 * NotSupportedError), which is what distinguishes user-cancel/timeout,
 * duplicate-credential, RP-ID mismatch, and unsupported-device failures.
 */
const getWebAuthnErrorDetail = (error: unknown): string => {
  if (error instanceof DOMException) {
    return error.name;
  }
  if (error && typeof error === "object" && "name" in error) {
    return String((error as { name: unknown }).name ?? "");
  }
  return "";
};

/**
 * Module-scope in-flight registry for `handleSetupPasskey` ceremonies, keyed
 * by `recoverySessionId`. Module-scope (not `useRef`) so dedup works across
 * the parallel `useRecoveryActions` instances mounted by `RecoveryRouter`
 * and its active sub-component. Entries are removed on completion (success
 * or failure) inside `handleSetupPasskey`.
 *
 * Exported so unit tests can clear/inspect it between runs; production code
 * outside this module should not import it directly.
 */
export const passkeyInFlightRegistry = new Map<string, Promise<boolean>>();

const useRecoveryActions = () => {
  const {
    state: {
      resources,
      eventService,
      requestService,
      recoverySessionId,
      userIdToRecover,
      username,
      systemFeedbackService,
      componentStateAndProps,
    },
    dispatch,
  } = useAccountRecoveryContext();

  const shouldAddContactMethod =
    componentStateAndProps.componentState === ComponentState.RESET_PASSWORD &&
    componentStateAndProps.additionalComponentProps?.shouldAddContactMethod === true;

  const experiments = useExperiments(EXPERIMENT_LAYER);

  const shouldShowPasskeyFirst =
    (experiments.shouldShowPasskeyFirst as boolean) && DeviceMeta && !DeviceMeta().isInApp;

  const shouldShowChoicePage =
    (experiments.shouldShowChoicePage as boolean) && DeviceMeta && !DeviceMeta().isInApp;

  const shouldShowAutoOSPasskeyDialogue =
    (experiments.shouldShowAutoOSPasskeyDialogue as boolean) && DeviceMeta && !DeviceMeta().isInApp;

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

  const handleSetupPasskey = React.useCallback(async (): Promise<boolean> => {
    if (!userIdToRecover || !username || !recoverySessionId) {
      return false;
    }

    // In-flight dedup: if a ceremony is already running for this
    // recoverySessionId, return the existing Promise so concurrent callers
    // observe the same outcome.
    const existingInFlight = passkeyInFlightRegistry.get(recoverySessionId);
    if (existingInFlight) {
      eventService.sendAuthMsgShown(
        AUTH_EVENT_CONSTANTS.state.passkeyUpselling.passkeyRegistrationDuplicateBlocked,
      );
      return existingInFlight;
    }

    const ceremony = (async (): Promise<boolean> => {
      const { passkeyRegistrationErrorSource } = AUTH_EVENT_CONSTANTS;
      const emitFailure = (source: string, detail: string): void => {
        systemFeedbackService.warning(resources.Message.Error.PasskeyRegistrationError);
        eventService.sendPasskeyRegistrationFailure(source, detail);
      };

      try {
        const startResult = await startPreAuthPasskeyRegistration(username);

        if (startResult.isError || startResult.value == null) {
          emitFailure(
            passkeyRegistrationErrorSource.start,
            startResult.isError
              ? String(httpService.parseErrorCode(startResult.errorRaw) ?? "")
              : "",
          );
          return false;
        }

        const { creationOptions, sessionId } = startResult.value;

        const makeCredentialOptions = fido2Util.convertPublicKeyParametersToStandardBase64(
          JSON.stringify(creationOptions),
        );

        eventService.sendAuthModalShown(
          AUTH_EVENT_CONSTANTS.state.passkeyUpselling.passkeyOsDialogue,
        );

        let credential: Credential | null;
        try {
          credential = await navigator.credentials.create({
            publicKey: fido2Util.formatCredentialRequestWeb(JSON.stringify(makeCredentialOptions)),
          });
        } catch (ceremonyError) {
          // OS WebAuthn prompt failed (user-cancel/timeout, unsupported
          // device, RP-ID mismatch, duplicate credential, ...). The
          // DOMException name is the distinguishing signal.
          // eslint-disable-next-line no-console
          console.error(ceremonyError);
          emitFailure(
            passkeyRegistrationErrorSource.osCeremony,
            getWebAuthnErrorDetail(ceremonyError),
          );
          return false;
        }

        if (credential === null) {
          emitFailure(passkeyRegistrationErrorSource.osCeremony, "nullCredential");
          return false;
        }

        const formattedCredentialResponse = fido2Util.formatCredentialRegistrationResponseWeb(
          credential as PublicKeyCredential,
        );

        const finishResult = await finishARPreAuthPasskeyRegistration(
          recoverySessionId,
          userIdToRecover,
          sessionId,
          formattedCredentialResponse,
          false,
          PasswordDeletionSource.AccountRecoveryPasskeyOnly,
        );

        if (!finishResult.isError) {
          eventService.sendAuthMsgShown(
            AUTH_EVENT_CONSTANTS.state.passkeyUpselling.passkeyRegistrationSuccess,
          );
          // todo: move these events to backend
          eventService.sendPasskeyCreationSourceEvent(
            AUTH_EVENT_CONSTANTS.state.passkeyCreation.accountRecovery,
          );
          eventService.sendPasswordDeactivationSourceEvent(
            AUTH_EVENT_CONSTANTS.state.passwordDeactivation.accountRecovery,
          );
          return true;
        }

        emitFailure(
          passkeyRegistrationErrorSource.finish,
          String(httpService.parseErrorCode(finishResult.errorRaw) ?? ""),
        );
        return false;
      } catch (error) {
        // Unexpected error not attributable to a specific step (e.g. a
        // credential-formatting failure).
        // eslint-disable-next-line no-console
        console.error(error);
        emitFailure(passkeyRegistrationErrorSource.unknown, getWebAuthnErrorDetail(error));
        return false;
      } finally {
        passkeyInFlightRegistry.delete(recoverySessionId);
      }
    })();

    passkeyInFlightRegistry.set(recoverySessionId, ceremony);
    return ceremony;
  }, [
    userIdToRecover,
    username,
    recoverySessionId,
    eventService,
    systemFeedbackService,
    resources,
  ]);

  const onPasswordResetSuccess = React.useCallback(
    (accountSwitchingBlob: string, destinationPath?: string) => {
      if (
        DeviceMeta &&
        DeviceMeta().isInApp &&
        (DeviceMeta().isPhone || DeviceMeta().isTablet) &&
        Hybrid?.Overlay
      ) {
        Hybrid.Overlay.close(() => undefined);
        return;
      }

      // An account-switching blob means the user is never auto-logged in, so
      // `destinationPath` is unreachable for them and login has to come first.
      const isLoggedIn = !accountSwitchingBlob && !(DeviceMeta && DeviceMeta().isInApp);
      const redirectUrl = urlService.getAbsoluteUrl(
        isLoggedIn ? (destinationPath ?? "/home") : "/login",
      );
      eventService.sendPasswordResetEvent(recoverySessionId, redirectUrl);
      window.location.href = redirectUrl;
    },
    [eventService, recoverySessionId],
  );

  const getAccountSwitchingBlob = React.useCallback(
    () => AccountSwitcherService?.getStoredAccountSwitcherBlob() ?? "",
    [],
  );

  /**
   * Fallback when auto-login fails after passkey registration — sends the user
   * to /login to authenticate with their new passkey. There is no session to
   * land anywhere else, so any requested destination is ignored.
   */
  const dispatchRecoverySuccessWithLoginRedirect = React.useCallback(() => {
    dispatch({
      type: AccountRecoveryActionType.SET_COMPONENT_STATE,
      recoverySessionState: RecoveryState.AccountVerified,
      componentState: ComponentState.RECOVERY_SUCCESS,
      additionalComponentProps: {
        shouldUpdateEmail: false,
        updatedEmail: "",
        shouldPrompt2svRemoval: false,
        shouldPromptPasskeyAddition: false,
        shouldPromptCredentialInvalidation: false,
        flowType: AUTH_EVENT_CONSTANTS.recoveryResetFlow.passkeyAutoLogin,
        onPasswordResetSuccess: () => {
          eventService.sendPasswordResetEvent(recoverySessionId, "/login");
          window.location.href = urlService.getAbsoluteUrl("/login");
        },
      },
    });
  }, [dispatch, eventService, recoverySessionId]);

  /**
   * After passkey registration + password deactivation, establish a session via
   * resetPassword with empty credentials. Retries once on transient errors.
   * Returns 'success' if auto-login worked, 'failed' otherwise.
   * Does NOT handle 2SV challenges — if 2SV triggers, returns 'failed'.
   */
  const performAutoLoginAfterPasskey = React.useCallback(
    async (maxRetries = 1): Promise<"success" | "failed"> => {
      eventService.sendPasswordResetSubmitted(
        AUTH_EVENT_CONSTANTS.recoveryResetFlow.passkeyAutoLogin,
      );
      let lastError: { code: number | null; statusCode: number | null } | null = null;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const accountSwitchingBlob = AccountSwitcherService?.getStoredAccountSwitcherBlob() ?? "";
        // eslint-disable-next-line no-await-in-loop
        const secureAuthenticationIntent = await cryptoUtil.generateSecureAuthIntentV2();
        // eslint-disable-next-line no-await-in-loop
        const result = await requestService.authApi.resetPassword(
          "RecoverySessionID",
          recoverySessionId,
          userIdToRecover ?? 0,
          "",
          "",
          undefined,
          undefined,
          accountSwitchingBlob,
          secureAuthenticationIntent,
        );

        if (!result.isError) {
          eventService.sendPasswordResetSucceeded(
            AUTH_EVENT_CONSTANTS.recoveryResetFlow.passkeyAutoLogin,
          );
          const blob = AccountSwitcherService?.getStoredAccountSwitcherBlob() ?? "";
          dispatch({
            type: AccountRecoveryActionType.SET_COMPONENT_STATE,
            recoverySessionState: RecoveryState.AccountVerified,
            componentState: ComponentState.RECOVERY_SUCCESS,
            additionalComponentProps: {
              shouldUpdateEmail: result.value.shouldUpdateEmail,
              updatedEmail: result.value.recoveryEmail,
              shouldPrompt2svRemoval: result.value.shouldPrompt2svRemoval ?? false,
              shouldPromptPasskeyAddition: false,
              shouldPromptCredentialInvalidation:
                result.value.shouldPromptCredentialInvalidation ?? false,
              flowType: AUTH_EVENT_CONSTANTS.recoveryResetFlow.passkeyAutoLogin,
              onPasswordResetSuccess: destinationPath =>
                onPasswordResetSuccess(blob, destinationPath),
            },
          });
          return "success";
        }

        lastError = {
          code: httpService.parseErrorCode(result.errorRaw),
          statusCode: result.errorStatusCode,
        };

        const isRetryable = result.error === PasswordResetError.UNKNOWN || result.error === null;
        if (!isRetryable) {
          break;
        }

        if (attempt < maxRetries) {
          // eslint-disable-next-line no-await-in-loop
          await new Promise(resolve => {
            setTimeout(resolve, AUTO_LOGIN_RETRY_DELAY_MS);
          });
        }
      }
      eventService.sendPasswordResetFailure(
        lastError?.code ?? null,
        lastError?.statusCode ?? null,
        AUTH_EVENT_CONSTANTS.recoveryResetFlow.passkeyAutoLogin,
      );
      return "failed";
    },
    [
      dispatch,
      eventService,
      onPasswordResetSuccess,
      recoverySessionId,
      requestService,
      userIdToRecover,
    ],
  );

  // --- Password reset state & logic ---

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [requestInFlight, setRequestInFlight] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const validateEmail = (value: string): string | null => {
    if (value === "") return null;
    return isValidEmail(value) ? null : resources.Message.Error.InvalidEmail;
  };

  const handleEmailChange = (value: string) => {
    setNewEmail(value);
    setRequestError(null);
    setEmailError(validateEmail(value));
  };

  const validatePassword = async (value: string): Promise<string | null> => {
    if (value === "") return null;
    const translationKey = await getInvalidPasswordMessage(value, username ?? undefined);
    return translationKey === "" ? null : mapPasswordErrorToResource(resources, translationKey);
  };

  const validateConfirmPassword = (repeated: string, original: string): string | null => {
    if (repeated === original) return null;
    return resources.Message.PasswordsDoNotMatch;
  };

  const handlePasswordChange = async (value: string) => {
    setPassword(value);
    setRequestError(null);
    const error = await validatePassword(value);
    setPasswordError(error);
    if (confirmPassword) {
      setConfirmPasswordError(validateConfirmPassword(confirmPassword, value));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setRequestError(null);
    setConfirmPasswordError(validateConfirmPassword(value, password));
  };

  const dispatchRecoverySuccess = React.useCallback(
    (
      resetResult: {
        shouldUpdateEmail: boolean;
        recoveryEmail: string;
        shouldPrompt2svRemoval?: boolean;
        shouldPromptPasskeyAddition?: boolean;
        shouldPromptCredentialInvalidation?: boolean;
      },
      flowType: string,
    ) => {
      const accountSwitchingBlob = AccountSwitcherService?.getStoredAccountSwitcherBlob() ?? "";
      dispatch({
        type: AccountRecoveryActionType.SET_COMPONENT_STATE,
        recoverySessionState: RecoveryState.AccountVerified,
        componentState: ComponentState.RECOVERY_SUCCESS,
        additionalComponentProps: {
          shouldUpdateEmail: resetResult.shouldUpdateEmail,
          updatedEmail: resetResult.recoveryEmail,
          shouldPrompt2svRemoval: resetResult.shouldPrompt2svRemoval ?? false,
          shouldPromptPasskeyAddition: resetResult.shouldPromptPasskeyAddition ?? false,
          shouldPromptCredentialInvalidation:
            resetResult.shouldPromptCredentialInvalidation ?? false,
          flowType,
          onPasswordResetSuccess: destinationPath =>
            onPasswordResetSuccess(accountSwitchingBlob, destinationPath),
        },
      });
    },
    [dispatch, onPasswordResetSuccess],
  );

  const handleTwoStepVerificationRequiredError = (
    errorRaw: TwoStepVerificationRequiredError,
    flowType: string,
    retryRequest: (
      twoStepVerificationChallengeId?: string,
      twoStepVerificationToken?: string,
    ) => Promise<void>,
  ) => {
    const { recovery2svIncompleteReason } = AUTH_EVENT_CONSTANTS;
    const challengeId = getChallengeIdFromTwoStepVerificationError(errorRaw);
    if (!challengeId || !userIdToRecover) {
      eventService.sendPasswordReset2svIncomplete(
        flowType,
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
      challengeId,
      actionType: TwoStepVerification.ActionType.PasswordReset,
      shouldShowRememberDeviceCheckbox: false,
      onChallengeCompleted: data => {
        // eslint-disable-next-line no-void
        void retryRequest(challengeId, data.verificationToken);
      },
      onChallengeInvalidated: data => {
        if (data.errorCode === TwoStepVerification.ErrorCode.SESSION_EXPIRED) {
          // eslint-disable-next-line no-void
          void retryRequest();
        } else {
          eventService.sendPasswordReset2svIncomplete(
            flowType,
            recovery2svIncompleteReason.invalidated,
          );
          setRequestInFlight(false);
          setRequestError(resources.Message.UnknownError);
        }
      },
      renderInline: false,
      onModalChallengeAbandoned: () => {
        eventService.sendPasswordReset2svIncomplete(
          flowType,
          recovery2svIncompleteReason.abandoned,
        );
        setRequestInFlight(false);
      },
    });
    if (!rendered) {
      eventService.sendPasswordReset2svIncomplete(
        flowType,
        recovery2svIncompleteReason.renderFailed,
      );
      setRequestInFlight(false);
      setRequestError(resources.Message.UnknownError);
    }
  };

  const executeResetPassword = async (
    flowType: string,
    twoStepVerificationChallengeId?: string,
    twoStepVerificationToken?: string,
  ) => {
    setRequestInFlight(true);
    const accountSwitchingBlob = AccountSwitcherService?.getStoredAccountSwitcherBlob() ?? "";
    const secureAuthenticationIntent = await cryptoUtil.generateSecureAuthIntentV2();
    const result = await requestService.authApi.resetPassword(
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
      newEmail || undefined,
    );

    if (result.isError) {
      if (result.error === PasswordResetError.TWO_STEP_VERIFICATION_REQUIRED) {
        // 2SV challenge shown — not a terminal failure, so no failure event here.
        handleTwoStepVerificationRequiredError(
          result.errorRaw as TwoStepVerificationRequiredError,
          flowType,
          (challengeId, token) => executeResetPassword(flowType, challengeId, token),
        );
        return;
      }
      eventService.sendPasswordResetFailure(
        httpService.parseErrorCode(result.errorRaw),
        result.errorStatusCode,
        flowType,
      );
      setRequestInFlight(false);
      setRequestError(mapPasswordResetErrorToResource(resources, result.error));
      return;
    }

    eventService.sendPasswordResetSucceeded(flowType);
    dispatchRecoverySuccess(result.value, flowType);
  };

  /**
   * Public entry for a user-initiated password-reset submit. Emits the
   * per-arm submit event exactly once (2SV auto-retries re-enter via
   * `executeResetPassword` and must not re-emit it).
   */
  const callResetPassword = async (
    flowType: string = AUTH_EVENT_CONSTANTS.recoveryResetFlow.passkeyFirst,
  ) => {
    eventService.sendPasswordResetSubmitted(flowType);
    await executeResetPassword(flowType);
  };

  const passwordValid = password.length > 0 && passwordError === null;
  const confirmPasswordValid = confirmPassword.length > 0 && confirmPasswordError === null;
  const newEmailValid = !shouldAddContactMethod || (newEmail.length > 0 && emailError === null);
  const canSubmitPassword =
    !requestInFlight && passwordValid && confirmPasswordValid && newEmailValid;

  return {
    handleSetupPasskey,
    isPasskeySupported,
    onPasswordResetSuccess,
    getAccountSwitchingBlob,
    performAutoLoginAfterPasskey,
    dispatchRecoverySuccessWithLoginRedirect,
    experiments,
    shouldShowPasskeyFirst,
    shouldShowChoicePage,
    shouldShowAutoOSPasskeyDialogue,
    requestService,
    eventService,
    resources,
    recoverySessionId,
    userIdToRecover,
    username,
    systemFeedbackService,
    password,
    setPassword,
    passwordError,
    confirmPassword,
    setConfirmPassword,
    confirmPasswordError,
    requestInFlight,
    setRequestInFlight,
    requestError,
    handlePasswordChange,
    handleConfirmPasswordChange,
    callResetPassword,
    dispatchRecoverySuccess,
    canSubmitPassword,
    shouldAddContactMethod,
    newEmail,
    emailError,
    handleEmailChange,
  };
};

export default useRecoveryActions;
