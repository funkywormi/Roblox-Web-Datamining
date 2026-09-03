import {
  convertPublicKeyParametersToStandardBase64,
  formatCredentialRequestWeb,
  formatCredentialRegistrationResponseWeb,
} from "@rbx/core-scripts/auth/fido2";
import {
  AuthApiError,
  startPasskeyRegistration,
  finishPasskeyRegistration,
} from "@rbx/authentication-common/passkey/api";
import {
  PasskeyRegistrationErrorOrigin,
  PasskeyRegistrationErrorOriginName,
  PasskeyRegistrationStage,
  sendPasskeyPromptTiming,
  sendPasskeyRegistrationError,
  sendPasskeyRegistrationStage,
} from "./logoutUpsellEvents";

// security-key-service generates the actual nickname; this client-side value is
// just a placeholder required by the FinishRegistration request shape.
const CREDENTIAL_NICKNAME = "Passkey";

// Passed to FinishRegistration so the server emits the passkeyRegistration
// event attributed to this flow
const REGISTRATION_SOURCE = "passkeyUpsellPostLogin";

// Collapse to a fixed vocabulary: `state` is queried as an enum, so an
// unbounded value would fragment the dashboards it feeds.

const errorName = (err: unknown): string => (err instanceof Error && err.name ? err.name : "error");

const apiErrorName = (error: AuthApiError | null | undefined): string => {
  if (error === null || error === undefined) {
    return "unknown";
  }
  return AuthApiError[error] ?? String(error);
};

/**
 * Performs a full WebAuthn passkey registration:
 *   StartRegistration → browser prompt → FinishRegistration
 *
 * Returns `true` on a successful end-to-end registration, `false` otherwise
 * (no platform support, server start/finish error, user cancellation, or any
 * thrown exception). Never throws — callers can drive UI state from the
 * boolean alone.
 *
 * Every exit path emits a stage event, and failures also emit an
 * `authClientError` naming the step — see `PasskeyRegistrationStage`.
 */
export const registerPasskey = async (): Promise<boolean> => {
  if (typeof PublicKeyCredential === "undefined") {
    sendPasskeyRegistrationError(
      PasskeyRegistrationErrorOrigin.CompatibilityCheck,
      "publicKeyCredentialUndefined",
    );
    return false;
  }

  try {
    sendPasskeyRegistrationStage(PasskeyRegistrationStage.StartRequested);
    const startResult = await startPasskeyRegistration();
    if (startResult.isError) {
      sendPasskeyRegistrationError(
        PasskeyRegistrationErrorOrigin.StartRegistration,
        apiErrorName(startResult.error),
      );
      return false;
    }

    const { creationOptions, sessionId } = startResult.value;
    const options = convertPublicKeyParametersToStandardBase64(JSON.stringify(creationOptions));
    const publicKey = formatCredentialRequestWeb(JSON.stringify(options));

    sendPasskeyRegistrationStage(PasskeyRegistrationStage.DialogInvoked);
    const dialogShownAt = Date.now();

    const reportDialogRejected = (
      origin: PasskeyRegistrationErrorOriginName,
      state: string,
    ): void => {
      sendPasskeyRegistrationStage(PasskeyRegistrationStage.DialogRejected);
      sendPasskeyPromptTiming(PasskeyRegistrationStage.DialogRejected, Date.now() - dialogShownAt);
      sendPasskeyRegistrationError(origin, state);
    };

    // Nested so a thrown prompt failure is attributed to the prompt rather
    // than to the catch-all below.
    let credential: Credential | null;
    try {
      credential = await navigator.credentials.create({ publicKey });
    } catch (err) {
      reportDialogRejected(
        PasskeyRegistrationErrorOrigin.RegisterCredentialsErrorCode,
        errorName(err),
      );
      return false;
    }

    if (!(credential instanceof PublicKeyCredential)) {
      reportDialogRejected(
        PasskeyRegistrationErrorOrigin.RegisterCredentialsEmptyResponse,
        credential === null ? "nullCredential" : "nonPublicKeyCredential",
      );
      return false;
    }

    sendPasskeyRegistrationStage(PasskeyRegistrationStage.DialogResolved);
    sendPasskeyPromptTiming(PasskeyRegistrationStage.DialogResolved, Date.now() - dialogShownAt);

    const attestation = formatCredentialRegistrationResponseWeb(credential);
    sendPasskeyRegistrationStage(PasskeyRegistrationStage.FinishRequested);
    const finishResult = await finishPasskeyRegistration(
      sessionId,
      CREDENTIAL_NICKNAME,
      attestation,
      REGISTRATION_SOURCE,
    );
    if (finishResult.isError) {
      sendPasskeyRegistrationError(
        PasskeyRegistrationErrorOrigin.FinishRegistration,
        apiErrorName(finishResult.error),
      );
      return false;
    }

    sendPasskeyRegistrationStage(PasskeyRegistrationStage.Registered);
    return true;
  } catch (err) {
    sendPasskeyRegistrationError(PasskeyRegistrationErrorOrigin.Unexpected, errorName(err));
    return false;
  }
};
