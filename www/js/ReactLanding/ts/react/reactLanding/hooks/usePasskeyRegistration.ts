import { useCallback } from 'react';
import { fido2Util } from 'core-roblox-utilities';
import { startPreauthRegistration } from '../services/passkeyRegistrationService';
import { parseErrorCode } from '../../common/utils/requestUtils';
import {
  sendPasskeyCeremonyTimingEvent,
  sendPasskeyOsDialogueShownEvent
} from '../services/eventService';

/**
 * Result of a single passkey registration attempt on the signup form.
 *
 * - `success`   — the OS ceremony produced an attestation; `result` carries the
 *                 `sessionId` + formatted `registrationResponse` to hand to
 *                 backend for credential binding
 * - `dismissed` — the user cancelled or let the OS prompt expire
 *                 (`NotAllowedError` / `AbortError`).
 * - `unsupported` — no usable platform authenticator; skip the passkey branch.
 * - `error`     — start-preauth request failed, the ceremony threw, or it
 *                 resolved with no credential.
 *
 * `reason` follows a `prefix:detail` convention (`startPreauth:`, `ceremony:`,
 * `dismissed:`) so `SPLIT(reason, ':')[1]` yields the failure class. Keep the
 * vocabulary closed — a browser-supplied string would be an unbounded group key.
 */
export type PasskeyAttemptOutcome =
  | { kind: 'success'; result: { sessionId: string; registrationResponse: string } }
  | { kind: 'dismissed'; reason?: string }
  | { kind: 'unsupported' }
  | { kind: 'error'; reason: string };

export type PasskeyCeremonyTelemetry = {
  ctx: string;
  trigger: string;
};

/**
 * Above this, a `NotAllowedError` is more likely the browser's ceremony timeout
 * than a user cancelling. Provisional — re-derive from the `authOperationTiming`
 * distribution.
 */
const CEREMONY_TIMEOUT_THRESHOLD_MS = 30000;

const now = (): number =>
  typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();

type TPasskeyClientCapabilities = {
  passkeyPlatformAuthenticator?: boolean;
  userVerifyingPlatformAuthenticator?: boolean;
};

type TPublicKeyCredentialWithCapabilities = typeof PublicKeyCredential & {
  isUserVerifyingPlatformAuthenticatorAvailable?: () => Promise<boolean>;
  getClientCapabilities?: () => Promise<TPasskeyClientCapabilities | undefined>;
};

/**
 * Best-effort extraction of a coarse failure cause for telemetry. Uses the
 * DOMException `name`, which is what distinguishes user-cancel/timeout
 * (`NotAllowedError`), RP-ID mismatch (`SecurityError`), unsupported device
 * (`NotSupportedError`), and duplicate credential (`InvalidStateError`).
 */
const getErrorName = (error: unknown): string => {
  if (error instanceof DOMException) {
    return error.name;
  }
  if (error && typeof error === 'object' && 'name' in error) {
    return String((error as { name: unknown }).name ?? '');
  }
  return '';
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof DOMException) {
    return error.message;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message ?? '');
  }
  return '';
};

const isTransportTimeout = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const { code } = error as Record<string, unknown>;
  return code === 'ECONNABORTED' || code === 'ETIMEDOUT' || /timeout/i.test(getErrorMessage(error));
};

/**
 * These all end the attempt before the OS prompt is raised, so without a label
 * they read as users declining a passkey rather than as a backend failure.
 */
export const classifyStartPreauthError = (error: unknown): string => {
  if (isTransportTimeout(error)) {
    return 'startPreauth:timeout';
  }

  const errorCode = parseErrorCode(error);
  if (errorCode !== null) {
    return `startPreauth:errorCode:${errorCode}`;
  }

  const status = (error as Record<string, unknown> | null)?.status;
  if (typeof status === 'number' && status > 0) {
    return `startPreauth:httpStatus:${status}`;
  }

  return 'startPreauth:networkError';
};

/**
 * WebAuthn collapses user-cancel and its own timeout into one `NotAllowedError`
 * whose message is free-form browser text, so `elapsedMs` is the only way to
 * separate them.
 */
export const classifyCredentialError = (
  error: unknown,
  elapsedMs: number
): PasskeyAttemptOutcome => {
  const name = getErrorName(error);
  if (name === 'AbortError') {
    return { kind: 'dismissed', reason: 'dismissed:aborted' };
  }
  if (name === 'NotAllowedError') {
    return {
      kind: 'dismissed',
      reason:
        elapsedMs >= CEREMONY_TIMEOUT_THRESHOLD_MS ? 'dismissed:timeout' : 'dismissed:userCancel'
    };
  }
  return { kind: 'error', reason: `ceremony:${name || 'unclassified'}` };
};

/**
 * Whether a usable platform authenticator is available for creating a passkey.
 * Uses `isUserVerifyingPlatformAuthenticatorAvailable` plus `getClientCapabilities`
 * as a fallback for browsers/webviews with non-standard WebAuthn implementations
 */
export const checkPlatformPasskeySupport = async (): Promise<boolean> => {
  if (!window.PublicKeyCredential) {
    return false;
  }

  // Probe independently so a partially implemented browser API cannot mask a
  // successful result from the other compatibility check.
  const publicKeyCredential = window.PublicKeyCredential as TPublicKeyCredentialWithCapabilities;
  const [isUvpaa, capabilities] = await Promise.all([
    (async () => {
      try {
        return await publicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.();
      } catch {
        return false;
      }
    })(),
    (async () => {
      try {
        return await publicKeyCredential.getClientCapabilities?.();
      } catch {
        return undefined;
      }
    })()
  ]);
  const hasPasskeyCapability = Boolean(
    capabilities?.passkeyPlatformAuthenticator || capabilities?.userVerifyingPlatformAuthenticator
  );
  return Boolean(isUvpaa || hasPasskeyCapability);
};

/**
 * Drives the client side of pre-authenticated passkey registration:
 * support check -> `start-preauth-registration` -> `navigator.credentials.create`.
 * Returns a typed outcome; never throws. The credential is not bound here and
 * caller is expected to pass the returned `sessionId`/`registrationResponse` to backend
 */
const usePasskeyRegistration = (): {
  attemptPreauthRegistration: (
    username: string,
    telemetry: PasskeyCeremonyTelemetry
  ) => Promise<PasskeyAttemptOutcome>;
} => {
  const attemptPreauthRegistration = useCallback(
    async (
      username: string,
      telemetry: PasskeyCeremonyTelemetry
    ): Promise<PasskeyAttemptOutcome> => {
      const supported = await checkPlatformPasskeySupport();
      if (!supported) {
        return { kind: 'unsupported' };
      }

      let sessionId: string;
      let creationOptions: string;
      try {
        ({ sessionId, creationOptions } = await startPreauthRegistration(username));
      } catch (error) {
        return { kind: 'error', reason: classifyStartPreauthError(error) };
      }

      // Before the ceremony, so a user who walks away mid-prompt still leaves a record.
      sendPasskeyOsDialogueShownEvent(telemetry.ctx, telemetry.trigger);
      const promptOpenedAt = now();
      const settle = (outcome: PasskeyAttemptOutcome): PasskeyAttemptOutcome => {
        sendPasskeyCeremonyTimingEvent(outcome, now() - promptOpenedAt);
        return outcome;
      };

      let credential: Credential | null;
      try {
        /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
        const makeCredentialOptions = fido2Util.convertPublicKeyParametersToStandardBase64(
          creationOptions
        );
        credential = await navigator.credentials.create({
          publicKey: fido2Util.formatCredentialRequestWeb(JSON.stringify(makeCredentialOptions))
        });
        /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
      } catch (error) {
        return settle(classifyCredentialError(error, now() - promptOpenedAt));
      }

      if (credential === null) {
        // Rare case where WebAuthn resolved without throwing but produced no credential.
        return settle({ kind: 'error', reason: 'ceremony:nullCredential' });
      }

      let registrationResponse: string;
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        registrationResponse = fido2Util.formatCredentialRegistrationResponseWeb(
          credential as PublicKeyCredential
        );
      } catch {
        return settle({ kind: 'error', reason: 'ceremony:responseFormattingFailed' });
      }

      return settle({
        kind: 'success',
        result: { sessionId, registrationResponse }
      });
    },
    []
  );

  return { attemptPreauthRegistration };
};

export default usePasskeyRegistration;
