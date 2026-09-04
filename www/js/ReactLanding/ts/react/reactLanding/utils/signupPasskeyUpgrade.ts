import { CredentialType } from '../../common/types/loginTypes';
import EVENT_CONSTANTS from '../../common/constants/eventsConstants';
import passkeySessionStorageKeys from '../../common/constants/passkeyUpgradeConstants';
import {
  attemptSetPasskeyUpgradeFlagCore,
  SilentPasskeyUpgradeVariant
} from '../../common/utils/silentPasskeyUpgradeCore';

export type SignupPasskeyUpgradeParams = {
  isConditionalCreateSupported: boolean;
  silentUpgradeBrowserCheck: SilentPasskeyUpgradeVariant;
  userId: string;
};

/**
 * Signup-flow wrapper around `attemptSetPasskeyUpgradeFlagCore` that hardcodes
 * `isPasskeyLoginSupported: true` — signup only probes `conditionalCreate` and
 * skips the broader passkey-login capability check. Never throws.
 */
export const attemptSetPasskeyUpgradeFlag = ({
  isConditionalCreateSupported,
  silentUpgradeBrowserCheck,
  userId
}: SignupPasskeyUpgradeParams): void => {
  try {
    attemptSetPasskeyUpgradeFlagCore({
      credentialType: CredentialType.Username,
      sourceCtx: EVENT_CONSTANTS.context.silentPasskeyUpgradeWebSignup,
      upgradeType: passkeySessionStorageKeys.upgradeDelayedSignup,
      upgradeCtx: EVENT_CONSTANTS.context.silentPasskeyUpgradeWebSignupDelayed,
      isPasskeyLoginSupported: true,
      isConditionalCreateSupported,
      silentUpgradeBrowserCheck,
      userId
    });
  } catch {
    // Fail-closed: never block signup navigation on a sessionStorage edge case.
  }
};
