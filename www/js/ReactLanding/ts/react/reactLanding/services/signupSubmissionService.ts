import { AccountSwitcherService } from 'Roblox';
import { buildAuthParamsWithSecureAuthIntentAndClientKeyPair } from '../../common/hardwareBackedAuth/utils/requestUtils';
import { SilentPasskeyUpgradeVariant } from '../../common/utils/silentPasskeyUpgradeCore';
import { TSignupParams, TSignupResponse } from '../../common/types/signupTypes';
import { counters } from '../constants/signupConstants';
import {
  incrementEphemeralCounter,
  sendSignupPasskeyBindFailureEvent,
  sendSignupPasskeyBindSuccessEvent
} from './eventService';
import { signup } from './signupService';
import { handlePostSignup } from '../utils/signupUtils';
import { getPasskeyBindFailureReason } from '../utils/passkeySignupErrorUtils';
import { attemptSetPasskeyUpgradeFlag } from '../utils/signupPasskeyUpgrade';

export type SubmitSignupOptions = {
  params: TSignupParams;
  returnUrl: string;
  isVerifiedParentConsentSignup: boolean;
  isVietnamSignup: boolean;
  isConditionalCreateSupported: boolean;
  silentPasskeyUpgradeBrowserCheck: SilentPasskeyUpgradeVariant;
};

export type SignupRequestResult = {
  result: TSignupResponse;
  usedSecureAuthenticationIntent: boolean;
};

export type CompleteSignupSuccessOptions = Omit<SubmitSignupOptions, 'params'> &
  SignupRequestResult;

/**
 * Adds secure-authentication request data and calls `/v2/signup`. Errors
 * propagate so the calling surface can classify them before any success-side
 * effects or navigation run.
 */
export const executeSignupRequest = async (params: TSignupParams): Promise<SignupRequestResult> => {
  const { authParams } = await buildAuthParamsWithSecureAuthIntentAndClientKeyPair(params);
  const result = await signup(authParams);

  return {
    result,
    usedSecureAuthenticationIntent: Boolean(authParams.secureAuthenticationIntent)
  };
};

/**
 * Applies the production success-side effects after a successful signup
 * request. Keeping this separate lets another signup surface inspect the
 * request outcome before choosing its completion behavior.
 */
export const completeSignupSuccess = async ({
  result,
  usedSecureAuthenticationIntent,
  returnUrl,
  isVerifiedParentConsentSignup,
  isVietnamSignup,
  isConditionalCreateSupported,
  silentPasskeyUpgradeBrowserCheck
}: CompleteSignupSuccessOptions): Promise<void> => {
  if (usedSecureAuthenticationIntent) {
    incrementEphemeralCounter(counters.successWithSAI);
  }
  if (isVietnamSignup) {
    incrementEphemeralCounter(counters.successWithVNG);
  }

  AccountSwitcherService?.storeAccountSwitcherBlob(result.accountBlob ?? '');

  if (isVerifiedParentConsentSignup) {
    await handlePostSignup(result.returnUrl ?? '');
    return;
  }

  attemptSetPasskeyUpgradeFlag({
    isConditionalCreateSupported,
    silentUpgradeBrowserCheck: silentPasskeyUpgradeBrowserCheck,
    userId: result.userId.toString()
  });
  await handlePostSignup(returnUrl, result.userId.toString());
};

/**
 * Executes the production signup request and its success-side effects.
 *
 * Bind telemetry is emitted here rather than by the calling surface because
 * `completeSignupSuccess` navigates away; anything emitted after it awaits may
 * not survive the page unload. Every terminal rejection is reported, including
 * ones the client cannot attribute, so the bind events stay reconcilable
 * against `SignupPreauthCredentialCreated`.
 */
export const submitSignup = async ({
  params,
  ...completionOptions
}: SubmitSignupOptions): Promise<void> => {
  const isPasskeySignup = Boolean(params.passkeySessionId);
  let requestResult: SignupRequestResult;
  try {
    requestResult = await executeSignupRequest(params);
  } catch (error) {
    const failureReason = isPasskeySignup ? getPasskeyBindFailureReason(error) : null;
    if (failureReason) {
      sendSignupPasskeyBindFailureEvent(failureReason);
    }
    throw error;
  }

  if (isPasskeySignup) {
    sendSignupPasskeyBindSuccessEvent();
  }

  await completeSignupSuccess({
    ...completionOptions,
    ...requestResult
  });
};
