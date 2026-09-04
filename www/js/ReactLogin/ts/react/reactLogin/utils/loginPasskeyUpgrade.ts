import { CredentialType } from '../../common/types/loginTypes';
import EVENT_CONSTANTS from '../../common/constants/eventsConstants';
import passkeySessionStorageKeys from '../../common/constants/passkeyUpgradeConstants';
import {
  attemptSetPasskeyUpgradeFlagCore,
  SilentPasskeyUpgradeVariant
} from '../../common/utils/silentPasskeyUpgradeCore';

export { SilentPasskeyUpgradeVariant };

export type LoginPasskeyUpgradeParams = {
  credentialType: CredentialType;
  isPasskeyLoginSupported: boolean;
  isConditionalCreateSupported: boolean;
  isPasswordAutofilled: boolean;
  loginSilentUpgradeBrowserCheck: SilentPasskeyUpgradeVariant;
  userId: string;
};

/**
 * Login-flow wrapper around `attemptSetPasskeyUpgradeFlagCore`. Picks the
 * Immediate vs Delayed login contexts based on `isPasswordAutofilled`
 * (autofilled = browser already has the credential, safe to upgrade now;
 * otherwise defer to next page load).
 */
export const attemptSetPasskeyUpgradeFlag = ({
  credentialType,
  isPasskeyLoginSupported,
  isConditionalCreateSupported,
  isPasswordAutofilled,
  loginSilentUpgradeBrowserCheck,
  userId
}: LoginPasskeyUpgradeParams): void => {
  attemptSetPasskeyUpgradeFlagCore({
    credentialType,
    sourceCtx: EVENT_CONSTANTS.context.silentPasskeyUpgradeWebLogin,
    upgradeType: isPasswordAutofilled
      ? passkeySessionStorageKeys.upgradeImmediateLogin
      : passkeySessionStorageKeys.upgradeDelayedLogin,
    upgradeCtx: isPasswordAutofilled
      ? EVENT_CONSTANTS.context.silentPasskeyUpgradeWebLoginImmediate
      : EVENT_CONSTANTS.context.silentPasskeyUpgradeWebLoginDelayed,
    isPasskeyLoginSupported,
    isConditionalCreateSupported,
    silentUpgradeBrowserCheck: loginSilentUpgradeBrowserCheck,
    userId
  });
};
